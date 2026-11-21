
const topRanking = document.getElementById("topRanking");
const rankingList = document.getElementById("rankingList");
const tabButtons = document.querySelectorAll(".tab-button");

let rankingType = "likes";

const sampleItems = [
    {
        id: "rank1",
        title: "3년 전 실내화",
        description: "1618 최강은",
        type: "화석",
        likes: 128,
        views: 145,
        image: "",
        date: "2026-11-20"
    },
    {
        id: "rank2",
        title: "추억의 필통",
        description: "1618 최강은",
        type: "유물",
        likes: 118,
        views: 132,
        image: "",
        date: "2026-11-19"
    },
    {
        id: "rank3",
        title: "오래된 공책",
        description: "1618 최강은",
        type: "화석",
        likes: 105,
        views: 120,
        image: "",
        date: "2026-11-18"
    },
    {
        id: "rank4",
        title: "수학 오답 노트",
        description: "1618 최강은",
        type: "유물",
        likes: 96,
        views: 103,
        image: "",
        date: "2026-11-17"
    },
    {
        id: "rank5",
        title: "추억의 연필",
        description: "1618 최강은",
        type: "화석",
        likes: 88,
        views: 95,
        image: "",
        date: "2026-11-16"
    },
    {
        id: "rank6",
        title: "오래된 노트",
        description: "1618 최강은",
        type: "유물",
        likes: 76,
        views: 86,
        image: "",
        date: "2026-11-15"
    },
    {
        id: "rank7",
        title: "학교 생활 기록",
        description: "1618 최강은",
        type: "화석",
        likes: 65,
        views: 72,
        image: "",
        date: "2026-11-14"
    }
];

function getItems() {
    const savedItems = JSON.parse(localStorage.getItem("museumItems")) || [];
    return [...savedItems, ...sampleItems];
}

function getScore(item) {
    return rankingType === "likes" ? item.likes : item.views;
}

function renderRanking() {
    const items = getItems().sort((a, b) => getScore(b) - getScore(a));

    topRanking.innerHTML = "";
    rankingList.innerHTML = "";

    if (items.length === 0) {
        rankingList.innerHTML = '<p class="empty-message">등록된 전시품이 없습니다.</p>';
        return;
    }

    items.slice(0, 3).forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "top-card";

        const image = item.image
            ? `<img class="top-image" src="${item.image}" alt="전시품 사진">`
            : `<div class="top-image"></div>`;

        card.innerHTML = `
            <div class="top-card-header">
                <span class="rank-number">${index + 1}</span>
                <span class="type-label">${item.type}</span>
            </div>
            ${image}
            <div class="top-info">
                <div>
                    <h3>${escapeText(item.title)}</h3>
                    <p>${escapeText(item.author || item.description || "1618 최강은")}</p>
                </div>
                <div class="like-count">
                    ${getScore(item)}
                    <small>${rankingType === "likes" ? "좋아요" : "조회수"}</small>
                </div>
            </div>
        `;

        topRanking.appendChild(card);
    });

    items.slice(3).forEach((item, index) => {
        const row = document.createElement("article");
        row.className = "rank-row";

        const image = item.image
            ? `<img class="rank-thumbnail" src="${item.image}" alt="전시품 사진">`
            : `<div class="rank-thumbnail"></div>`;

        row.innerHTML = `
            <span class="rank-number">${index + 4}</span>
            ${image}
            <div class="rank-description">
                <h3>${escapeText(item.title)}</h3>
                <p>${escapeText(item.author || item.description || "1618 최강은")}</p>
            </div>
            <div class="rank-likes">
                ${getScore(item)} ${rankingType === "likes" ? "좋아요" : "조회수"}
                <small>전체 순위 ${index + 4}위</small>
            </div>
        `;

        rankingList.appendChild(row);
    });
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

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(tab => tab.classList.remove("active"));
        button.classList.add("active");

        rankingType = button.dataset.ranking;
        renderRanking();
    });
});

renderRanking();
