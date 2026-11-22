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
const previewAuthor = document.getElementById("previewAuthor");
const currentCount = document.getElementById("currentCount");

// 등록 폼
const uploadForm = document.getElementById("uploadForm");
const submitButton = document.getElementById("submitButton");

// 선택된 정보
let selectedType = "유물";
let selectedFile = null; // ⭐ 저장소에 올릴 "사진 파일" (예전엔 글자로 바꾼 사진을 브라우저에 저장했음)
let me = null;           // ⭐ 로그인한 사람

// ⭐ 페이지가 열리면 로그인 확인 + 미리보기에 내 이름
async function init() {
    me = await requireLogin();
    if (!me) return;
    previewAuthor.textContent = `${me.studentId} ${me.name}`;
}

// 사진 찍기 버튼 → 카메라 창 열기
cameraButton.addEventListener("click", () => {
    openCamera();
});

// 앨범에서 선택하기 버튼
albumButton.addEventListener("click", () => {
    albumInput.click();
});

// 파일 선택창(input)에서 고른 사진 표시
function showImage(input) {
    const file = input.files[0];
    input.value = ""; // 같은 사진을 다시 골라도 change가 일어나게 비워둠

    if (file) setImageFile(file);
}

// ⭐ 사진 파일 하나를 받아서 검사 → 저장 → 화면에 표시
// (앨범에서 고른 사진, 카메라로 찍은 사진 모두 여기로 들어옴)
function setImageFile(file) {
    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
        alert("이미지 파일을 선택해주세요.");
        return;
    }

    // ⭐ 너무 큰 사진 막기 (20MB)
    if (file.size > 20 * 1024 * 1024) {
        alert("사진이 너무 커요. 20MB 이하 사진을 골라주세요.");
        return;
    }

    selectedFile = file;

    // 사진을 읽어서 화면에 표시 (미리보기용)
    const reader = new FileReader();

    reader.onload = function () {
        uploadedImage.src = reader.result;
        uploadedImage.classList.add("show");
        imageArea.classList.add("has-image");

        applyFilter();
    };

    reader.readAsDataURL(file);
}

// 카메라 창을 못 쓸 때 대신 여는 파일 선택창 (핸드폰에서는 기본 카메라 앱이 열림)
cameraInput.addEventListener("change", () => {
    showImage(cameraInput);
});

// =====================================================
// ⭐ 카메라 창 (getUserMedia: 브라우저에서 카메라 화면을 직접 받아옴)
// =====================================================
const cameraDialog = document.getElementById("cameraDialog");
const cameraVideo = document.getElementById("cameraVideo");
const cameraShot = document.getElementById("cameraShot");
const cameraMessage = document.getElementById("cameraMessage");
const liveControls = document.getElementById("liveControls");
const reviewControls = document.getElementById("reviewControls");
const cameraShutter = document.getElementById("cameraShutter");
const cameraSwitch = document.getElementById("cameraSwitch");

let cameraStream = null;          // 지금 켜져 있는 카메라
let facingMode = "environment";   // environment = 뒷면 카메라, user = 앞면(셀카) 카메라
let shotFile = null;              // 방금 찍은 사진 (아직 "이 사진 쓰기" 전)

async function openCamera() {
    // 카메라 기능이 없는 브라우저 (또는 https가 아닌 주소) → 예전처럼 파일 선택창
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraInput.click();
        return;
    }

    showLiveMode();
    cameraDialog.showModal();
    await startCamera();
}

async function startCamera() {
    stopCamera();
    cameraShutter.disabled = true;
    cameraMessage.textContent = "카메라를 켜는 중이에요...";
    cameraMessage.hidden = false;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: facingMode }, // 노트북처럼 카메라가 하나면 알아서 그걸 씀
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });
    } catch (error) {
        console.error(error);
        cameraDialog.close();

        if (error.name === "NotAllowedError") {
            alert("카메라 권한이 막혀 있어요.\n주소창 왼쪽의 자물쇠 아이콘을 눌러 카메라를 '허용'으로 바꿔주세요.");
        } else if (error.name === "NotFoundError") {
            alert("카메라를 찾을 수 없어요. '앨범에서 선택하기'로 사진을 올려주세요.");
        } else {
            alert("카메라를 켜지 못했어요. 다른 프로그램이 카메라를 쓰고 있는지 확인해주세요.");
        }
        return;
    }

    // 창이 열리는 사이에 사용자가 취소했으면 바로 끄기
    if (!cameraDialog.open) {
        stopCamera();
        return;
    }

    cameraVideo.srcObject = cameraStream;

    // 셀카(앞면) 카메라는 거울처럼 좌우반전해서 보여주기 (찍히는 사진은 반전 안 됨)
    const settings = cameraStream.getVideoTracks()[0].getSettings();
    cameraVideo.classList.toggle("mirror", settings.facingMode !== "environment");

    // 고른 필터(유물/화석)를 카메라 화면에도 미리 보여주기
    cameraVideo.style.filter = getFilterValue();

    cameraMessage.hidden = true;
    cameraShutter.disabled = false;

    // 카메라가 2개 이상(핸드폰, 태블릿)일 때만 전환 버튼 보이기
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameraCount = devices.filter(device => device.kind === "videoinput").length;
    cameraSwitch.hidden = cameraCount < 2;
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop()); // 카메라 불 끄기
        cameraStream = null;
    }
    cameraVideo.srcObject = null;
}

// 찰칵: 지금 화면을 canvas에 그려서 jpg 파일로 만들기
cameraShutter.addEventListener("click", () => {
    const width = cameraVideo.videoWidth;
    const height = cameraVideo.videoHeight;
    if (!width || !height) return;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(cameraVideo, 0, 0, width, height);

    canvas.toBlob(blob => {
        if (!blob) {
            alert("사진을 만들지 못했어요. 다시 찍어주세요.");
            return;
        }

        shotFile = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });

        if (cameraShot.src) URL.revokeObjectURL(cameraShot.src);
        cameraShot.src = URL.createObjectURL(blob);
        cameraShot.style.filter = getFilterValue();
        showReviewMode();
    }, "image/jpeg", 0.9);
});

// 앞/뒤 카메라 바꾸기
cameraSwitch.addEventListener("click", () => {
    facingMode = facingMode === "environment" ? "user" : "environment";
    startCamera();
});

// 다시 찍기
document.getElementById("cameraRetake").addEventListener("click", () => {
    shotFile = null;
    showLiveMode();
});

// 이 사진 쓰기 → 앨범 사진과 똑같이 처리
document.getElementById("cameraUse").addEventListener("click", () => {
    if (shotFile) setImageFile(shotFile);
    cameraDialog.close();
});

// 취소
document.getElementById("cameraCancel").addEventListener("click", () => {
    cameraDialog.close();
});

// 어떤 방법으로 닫혀도(취소, 사진 쓰기, Esc 키) 카메라는 꼭 끄기
cameraDialog.addEventListener("close", () => {
    stopCamera();
    shotFile = null;
});

function showLiveMode() {
    cameraVideo.hidden = false;
    cameraShot.hidden = true;
    liveControls.hidden = false;
    reviewControls.hidden = true;
}

function showReviewMode() {
    cameraVideo.hidden = true;
    cameraShot.hidden = false;
    liveControls.hidden = true;
    reviewControls.hidden = false;
}

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

// 사진 필터 적용 (gallery.css, ranking.css의 필터와 같은 값)
function getFilterValue() {
    return selectedType === "유물"
        ? "sepia(0.65) saturate(0.85) brightness(1.05)"
        : "grayscale(1) contrast(0.95)";
}

function applyFilter() {
    uploadedImage.style.filter = getFilterValue();
    previewType.style.color = selectedType === "유물" ? "#b69a70" : "#888888";
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

// ⭐ 전시품 등록: 사진 → 저장소, 글 → exhibits 테이블
uploadForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!me) return;

    // 사진 확인
    if (!selectedFile) {
        alert("전시품 사진을 먼저 선택해주세요.");
        return;
    }

    // 제목과 설명 확인
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title || !description) {
        alert("제목과 설명을 모두 입력해주세요.");
        return;
    }

    // 두 번 누르기 방지
    submitButton.disabled = true;
    submitButton.textContent = "전시하는 중...";

    // ① 파일 이름: 한글 이름 오류를 피하려고 "내id/시간.확장자"로 지음
    const ext = selectedFile.name.includes(".")
        ? selectedFile.name.split(".").pop().toLowerCase()
        : "jpg";
    const path = `${me.id}/${Date.now()}.${ext}`;

    // ② 사진을 저장소(images 버킷)에 올리기
    const { error: uploadError } = await db.storage
        .from("images")
        .upload(path, selectedFile, { contentType: selectedFile.type });

    if (uploadError) {
        alert("사진을 올리지 못했어요: " + uploadError.message);
        resetSubmitButton();
        return;
    }

    // ③ 올린 사진의 공개 주소 받기
    const imageUrl = db.storage.from("images").getPublicUrl(path).data.publicUrl;

    // ④ exhibits 테이블에 저장 (author_id는 반드시 로그인한 본인)
    const { error: insertError } = await db.from("exhibits").insert({
        title: title,
        description: description,
        category: selectedType,
        image_url: imageUrl,
        author_id: me.id
    });

    if (insertError) {
        alert("전시품을 저장하지 못했어요: " + insertError.message);
        resetSubmitButton();
        return;
    }

    alert("박물관에 전시되었습니다!");
    window.location.href = "gallery.html";
});

function resetSubmitButton() {
    submitButton.disabled = false;
    submitButton.textContent = "박물관에 전시하기 →";
}

// 처음 화면 설정
currentCount.textContent = descriptionInput.value.length;
applyFilter();
init();
