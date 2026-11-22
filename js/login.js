// 로그인 페이지
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');

// form의 submit = 버튼 클릭 + 엔터 둘 다
loginForm.addEventListener('submit', async event => {
    event.preventDefault(); // 페이지 새로고침 막기

    const studentId = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-pw').value;

    loginButton.disabled = true; // 두 번 누르기 방지

    const { error } = await db.auth.signInWithPassword({
        email: toEmail(studentId),
        password: password
    });

    if (error) {
        alert('학번 또는 비밀번호가 틀렸어요.');
        loginButton.disabled = false;
        return;
    }

    location.href = 'mirim_museum_Home.html';
});
