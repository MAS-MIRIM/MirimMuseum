// 첫 화면: 이미 로그인한 상태면 바로 홈으로
async function checkAlreadyLoggedIn() {
    const { data } = await db.auth.getSession();
    if (data.session) {
        location.href = 'mirim_museum_Home.html';
    }
}

checkAlreadyLoggedIn();
