
// 사진 선택 요소
const cameraInput = document.getElementById("cameraInput");
const albumInput = document.getElementById("albumInput");

const cameraButton = document.getElementById("cameraButton");
const albumButton = document.getElementById("albumButton");

const uploadedImage = document.getElementById("uploadedImage");
const imageArea = document.getElementById("imageArea");

// 필터 요소
const filterButtons = document.querySelectorAll(".filter-option");

// 제목과 설명 요소
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");

// 미리보기 요소
const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");
const previewType = document.getElementById("previewType");
const currentCount = document.getElementById("currentCount");

// 등록 폼
const uploadForm = document.getElementById("uploadForm");

// 선택된 정보
let selectedType = "유물";
let selectedImage = "";

// 사진 찍기 버튼
cameraButton.addEventListener("click", () => {
    cameraInput.click();
});

// 앨범에서 선택하기 버튼
albumButton.addEventListener("click", () => {
    albumInput.click();
});

// 사진 표시 함수
function showImage(input) {
    const file = input.files[0];

    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
        alert("이미지 파일을 선택해주세요.");
        input.value = "";
        return;
    }

    // 사진을 읽어서 화면에 표시
    const reader = new FileReader();

    reader.onload = function () {
        selectedImage = reader.result;

        uploadedImage.src = selectedImage;
        uploadedImage.classList.add("show");
        imageArea.classList.add("has-image");

        applyFilter();
    };

    reader.readAsDataURL(file);
}

// 카메라로 찍은 사진 표시
cameraInput.addEventListener("change", () => {
    showImage(cameraInput);
});

// 앨범에서 선택한 사진 표시
albumInput.addEventListener("change", () => {
    showImage(albumInput);
});

// 유물 / 화석 필터 선택
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedType =
            button.dataset.filter === "artifact" ? "유물" : "화석";

        applyFilter();
    });
});

// 사진 필터 적용
function applyFilter() {
    if (selectedType === "유물") {
        uploadedImage.style.filter =
            "sepia(0.65) saturate(0.85) brightness(1.05)";

        previewType.style.color = "#b69a70";
    } else {
        uploadedImage.style.filter =
            "grayscale(1) contrast(0.95)";

        previewType.style.color = "#888888";
    }

    previewType.textContent = selectedType;
}

// 제목 미리보기
titleInput.addEventListener("input", () => {
    previewTitle.textContent =
        titleInput.value || "제목을 입력해주세요.";
});

// 설명 미리보기 및 글자 수
descriptionInput.addEventListener("input", () => {
    previewDescription.textContent =
        descriptionInput.value || "설명을 입력해주세요.";

    currentCount.textContent = descriptionInput.value.length;
});

// 전시품 등록
uploadForm.addEventListener("submit", event => {
    event.preventDefault();

    // 사진 확인
    if (!selectedImage) {
        alert("전시품 사진을 먼저 선택해주세요.");
        return;
    }

    // 제목과 설명 확인
    if (!titleInput.value.trim() || !descriptionInput.value.trim()) {
        alert("제목과 설명을 모두 입력해주세요.");
        return;
    }

    // 전시품 정보 생성
    const newItem = {
        id: "item-" + Date.now(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        type: selectedType,
        image: selectedImage,
        author: "1618 최강은",
        likes: 0,
        views: 0,
        date: new Date().toISOString()
    };

    // 기존 전시품 가져오기
    const items =
        JSON.parse(localStorage.getItem("museumItems")) || [];

    // 새 전시품 추가
    items.unshift(newItem);

    // 브라우저에 저장
    try {
        localStorage.setItem("museumItems", JSON.stringify(items));

        alert("전시품이 등록되었습니다.");

        window.location.href = "gallery.html";

    } catch (error) {
        alert("사진 용량이 너무 커서 저장하지 못했습니다. 더 작은 사진을 선택해주세요.");
    }
});

// 처음 화면 설정
currentCount.textContent = descriptionInput.value.length;
applyFilter();
