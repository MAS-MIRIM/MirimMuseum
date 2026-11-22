const galleryGrid = document.getElementById("galleryGrid");

const typeButtons = document.querySelectorAll(".type-button");
const sortButtons = document.querySelectorAll(".sort-button");

// 크게 보기 창
const dialog = document.getElementById("exhibitDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogType = document.getElementById("dialogType");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDescription = document.getElementById("dialogDescription");
const dialogMeta = document.getElementById("dialogMeta");

let selectedType = "all";
let selectedSort = "latest";

let me = null;        // 로그인한 사람
let allItems = [];    // DB에서 가져온 전시품 전체
let likedIds = [];    // 내가 좋아요 누른 전시품 번호들

// DB에서 전시품 + 작성자 + 좋아요 수 가져오기 (예전엔 가짜 sampleItems였음)
async function loadGallery() {
    me = await requireLogin();
    if (!me) return;

    const { data, error } = await db
        .from("exhibits")
        .select("id, title, description, category, image_url, views, created_at, profiles!author_id(student_id, name), likes(count)");
        // profiles!author_id : 작성자 길로 가서 학번, 이름 가져오기

    if (error) {
        console.error(error);
        galleryGrid.innerHTML = '<p class="empty-message">전시품을 불러오지 못했어요. 새로고침 해주세요.</p>';
        return;
    }

    // DB 모양 → 화면에서 쓰기 편한 모양으로 바꾸기
    allItems = data.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.category,
        image: row.image_url,
        views: row.views,
        likes: row.likes[0] ? row.likes[0].count : 0,
        author: row.profiles ? `${row.profiles.student_id} ${row.profiles.name}` : "알 수 없음",
        date: row.created_at
    }));

    // 내가 좋아요 누른 전시품 번호들
    const { data: myLikes } = await db
        .from("likes")
        .select("exhibit_id")
        .eq("user_id", me.id);

    likedIds = (myLikes || []).map(row => row.exhibit_id);

    renderGallery();
}

function renderGallery() {
    let items = [...allItems];

    if (selectedType !== "all") {
        items = items.filter(item => item.type === selectedType);
    }

    if (selectedSort === "popular") {
        items.sort((a, b) => b.likes - a.likes);
    } else if (selectedSort === "latest") {
        items.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        items.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    galleryGrid.innerHTML = "";

    if (items.length === 0) {
        galleryGrid.innerHTML =
            '<p class="empty-message">아직 전시품이 없어요. 첫 번째로 올려보세요!</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "exhibit-card";

        const liked = likedIds.includes(item.id);

        card.innerHTML = `
            <img class="exhibit-image ${filterClass(item.type)}"
                 src="${escapeText(item.image)}" alt="${escapeText(item.title)}">

            <div class="exhibit-info">
                <h3>${escapeText(item.title)}</h3>
                <p>${escapeText(item.description || "")}</p>
            </div>

            <div class="exhibit-bottom">
                <span>${escapeText(item.author)}</span>

                <div class="exhibit-actions">
                    <span class="view-count">조회 ${item.views}</span>
                    <button class="like-button ${liked ? "liked" : ""}" type="button">
                        ${liked ? "♥" : "♡"} ${item.likes}
                    </button>
                </div>
            </div>
        `;

        // 사진 누르면 크게 보기 + 조회수 +1
        card.querySelector(".exhibit-image").addEventListener("click", () => {
            openExhibit(item, card);
        });

        // 좋아요 누르기 / 취소
        const likeButton = card.querySelector(".like-button");
        likeButton.addEventListener("click", () => {
            toggleLike(item, likeButton);
        });

        galleryGrid.appendChild(card);
    });
}

// 좋아요: likes 테이블에 넣거나 지우기 (한 사람당 한 번)
async function toggleLike(item, likeButton) {
    const liked = likedIds.includes(item.id);
    likeButton.disabled = true; // 연타 방지

    const { error } = liked
        ? await db.from("likes").delete().eq("user_id", me.id).eq("exhibit_id", item.id)
        : await db.from("likes").insert({ user_id: me.id, exhibit_id: item.id });

    likeButton.disabled = false;

    if (error) {
        alert("좋아요를 처리하지 못했어요: " + error.message);
        return;
    }

    if (liked) {
        likedIds = likedIds.filter(id => id !== item.id);
        item.likes -= 1;
    } else {
        likedIds.push(item.id);
        item.likes += 1;
    }

    likeButton.classList.toggle("liked", !liked);
    likeButton.textContent = `${liked ? "♡" : "♥"} ${item.likes}`;
}

// 크게 보기: 열 때마다 조회수 +1 (DB 함수 increment_views)
async function openExhibit(item, card) {
    dialogImage.src = item.image;
    dialogImage.alt = item.title;
    dialogImage.className = `dialog-image ${filterClass(item.type)}`;
    dialogType.textContent = item.type;
    dialogTitle.textContent = item.title;
    dialogDescription.textContent = item.description || "";
    dialogMeta.textContent = `기증자 ${item.author} · 조회 ${item.views + 1}`;
    dialog.showModal();

    const { error } = await db.rpc("increment_views", { exhibit_id: item.id });
    if (!error) {
        item.views += 1;
        card.querySelector(".view-count").textContent = `조회 ${item.views}`;
    }
}

// 창 닫기: X 버튼, 바깥(어두운 부분) 클릭
document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
});

typeButtons.forEach(button => {
    button.addEventListener("click", () => {
        typeButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        selectedType = button.dataset.type;
        renderGallery();
    });
});

sortButtons.forEach(button => {
    button.addEventListener("click", () => {
        sortButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        selectedSort = button.dataset.sort;
        renderGallery();
    });
});

loadGallery();
