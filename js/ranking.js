const topRanking = document.getElementById("topRanking");
const rankingList = document.getElementById("rankingList");
const tabButtons = document.querySelectorAll(".tab-button");

let rankingType = "likes";

// DB의 랭킹 뷰(exhibit_ranking)에서 순위 가져오기 (예전엔 가짜 sampleItems였음)
async function loadRanking() {
    // 좋아요 순위: 좋아요 → 같으면 조회수 / 조회수 순위: 조회수 → 같으면 좋아요
    const first = rankingType === "likes" ? "like_count" : "views";
    const second = rankingType === "likes" ? "views" : "like_count";

    const { data, error } = await db
        .from("exhibit_ranking")
        .select("*")
        .order(first, { ascending: false })
        .order(second, { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
        topRanking.innerHTML = "";
        rankingList.innerHTML = '<p class="empty-message">순위를 불러오지 못했어요. 새로고침 해주세요.</p>';
        return;
    }

    renderRanking(data);
}

function getScore(item) {
    return rankingType === "likes" ? item.like_count : item.views;
}

function renderRanking(items) {
    const label = rankingType === "likes" ? "좋아요" : "조회수";

    topRanking.innerHTML = "";
    rankingList.innerHTML = "";

    if (items.length === 0) {
        rankingList.innerHTML = '<p class="empty-message">아직 전시품이 없어요.</p>';
        return;
    }

    // 1~3위: 큰 카드
    items.slice(0, 3).forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "top-card";

        card.innerHTML = `
            <div class="top-card-header">
                <span class="rank-number">${index + 1}</span>
                <span class="type-label">${escapeText(item.category)}</span>
            </div>
            <img class="top-image ${filterClass(item.category)}"
                 src="${escapeText(item.image_url)}" alt="${escapeText(item.title)}">
            <div class="top-info">
                <div>
                    <h3>${escapeText(item.title)}</h3>
                    <p>${escapeText(item.author_name)}</p>
                </div>
                <div class="like-count">
                    ${getScore(item)}
                    <small>${label}</small>
                </div>
            </div>
        `;

        topRanking.appendChild(card);
    });

    // 4위부터: 줄 목록
    items.slice(3).forEach((item, index) => {
        const row = document.createElement("article");
        row.className = "rank-row";

        row.innerHTML = `
            <span class="rank-number">${index + 4}</span>
            <img class="rank-thumbnail ${filterClass(item.category)}"
                 src="${escapeText(item.image_url)}" alt="${escapeText(item.title)}">
            <div class="rank-description">
                <h3>${escapeText(item.title)}</h3>
                <p>${escapeText(item.author_name)}</p>
            </div>
            <div class="rank-likes">
                ${getScore(item)} ${label}
                <small>전체 순위 ${index + 4}위</small>
            </div>
        `;

        rankingList.appendChild(row);
    });
}

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(tab => tab.classList.remove("active"));
        button.classList.add("active");

        rankingType = button.dataset.ranking;
        loadRanking();
    });
});

// 로그인 확인 후 랭킹 불러오기
requireLogin().then(me => {
    if (me) loadRanking();
});
