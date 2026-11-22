// 회원가입 페이지
const signupForm = document.getElementById('signupForm');
const signupButton = document.getElementById('signupButton');

signupForm.addEventListener('submit', async event => {
    event.preventDefault();

    const studentId = document.getElementById('user-id').value.trim();
    const password = document.getElementById('user-pw').value;
    const name = document.getElementById('user-name').value.trim();

    // 학번은 숫자만
    if (!/^\d+$/.test(studentId)) {
        alert('학번은 숫자만 입력해주세요.');
        return;
    }

    if (password.length < 6) {
        alert('비밀번호는 6자 이상이어야 해요.');
        return;
    }

    signupButton.disabled = true;

    const { error } = await db.auth.signUp({
        email: toEmail(studentId),
        password: password,
        options: {
            // 이 정보가 raw_user_meta_data로 가고, 트리거가 profiles에 넣어줘요
            data: { student_id: studentId, name: name }
        }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            alert('이미 가입된 학번이에요. 로그인해주세요.');
        } else {
            alert('가입 실패: ' + error.message);
        }
        signupButton.disabled = false;
        return;
    }

    // 확인 메일을 꺼뒀기 때문에 가입하면 바로 로그인 상태가 돼요
    alert(`${name}님, 미림 박물관에 오신 걸 환영해요!`);
    location.href = 'mirim_museum_Home.html';
});
