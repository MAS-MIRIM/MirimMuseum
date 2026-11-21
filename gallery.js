
const galleryGrid = document.getElementById("galleryGrid");

const typeButtons = document.querySelectorAll(".type-button");
const sortButtons = document.querySelectorAll(".sort-button");

let selectedType = "all";
let selectedSort = "latest";

const sampleItems = [
    {
        id: "sample1",
        title: "스프링 필통",
        description: "우리가 매일 사용했던 추억의 필통",
        type: "화석",
        author: "1618 최강은",
        likes: 122,
        views: 12,
        date: "2026-11-20"
    },
    {
        id: "sample2",
        title: "스프링 필통",
        description: "오래된 필통에 담긴 추억",
        type: "화석",
        author: "1618 최강은",
        likes: 122,
        views: 12,
        date: "2026-11-19"
    },
    {
        id: "sample3",
        title: "스프링 필통",
        description: "오래된 필통을 다시 소개합니다",
        type: "유물",
        author: "1618 최강은",
        likes: 152,
        views: 20,
        date: "2026-11-18"
    },
    {
        id: "sample4",
        title: "스프링 필통",
        description: "시간이 지나도 남아 있는 물건",
        type: "유물",
        author: "1618 최강은",
        likes: 132,
        views: 18,
        date: "2026-11-17"
    },
    {
        id: "sample5",
        title: "오래된 공책",
        description: "학창 시절의 기록이 담긴 공책",
        type: "화석",
        author: "1618 최강은",
        likes: 92,
        views: 15,
        date: "2026-11-16"
    },
    {
        id: "sample6",
        title: "추억의 필통",
        description: "오랫동안 사용했던 필통",
        type: "유물",
        author: "1618 최강은",
        likes: 82,
        views: 10,
        date: "2026-11-15"
    },
    {
        id: "sample7",
        title: "오래된 연필",
        description: "매일 사용했던 연필",
        type: "화석",
        author: "1618 최강은",
        likes: 72,
        views: 9,
        date: "2026-11-14"
    },
    {
        id: "sample8",
        title: "추억의 노트",
        description: "소중한 기록을 담은 노트",
        type: "유물",
        author: "1618 최강은",
        likes: 62,
        views: 8,
        date: "2026-11-13"
    }
];

function getGalleryItems() {
    const savedItems = JSON.parse(localStorage.getItem("museumItems")) || [];
    return [...savedItems, ...sampleItems];
}

function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderGallery() {
    let items = getGalleryItems();

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
            '<p class="empty-message">등록된 전시품이 없습니다.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "exhibit-card";

        const imageHTML = item.image
            ? `<img class="exhibit-image ${item.type === "유물" ? "artifact" : "fossil"}"
                    src="${item.image}" alt="${escapeText(item.title)}">`
            : `<div class="exhibit-image-placeholder ${item.type === "화석" ? "fossil" : ""}">
                    <span class="exhibit-type">${escapeText(item.type)}</span>
               </div>`;

        card.innerHTML = `
            ${imageHTML}

            <div class="exhibit-info">
                <h3>${escapeText(item.title)}</h3>
                <p>${escapeText(item.description || "전시품 설명")}</p>
            </div>

            <div class="exhibit-bottom">
                <span>${escapeText(item.author || "1618 최강은")}</span>

                <div class="exhibit-actions">
                    <span class="view-count">♡ ${item.views || 0}</span>
                    <button class="like-button" type="button">
                        ♡ ${item.likes || 0}
                    </button>
                </div>
            </div>
        `;

        const likeButton = card.querySelector(".like-button");

        likeButton.addEventListener("click", () => {
            const savedItems = JSON.parse(localStorage.getItem("museumItems")) || [];
            const savedItem = savedItems.find(saved => saved.id === item.id);

            if (savedItem) {
                savedItem.likes = (savedItem.likes || 0) + 1;
                localStorage.setItem("museumItems", JSON.stringify(savedItems));
                item.likes = savedItem.likes;
            } else {
                item.likes = (item.likes || 0) + 1;
            }

            likeButton.classList.add("liked");
            likeButton.textContent = `♥ ${item.likes}`;
        });

        galleryGrid.appendChild(card);
    });
}

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

renderGallery();
