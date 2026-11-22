//모든 페이지의 공통 코드

const SUPABASE_URL = 'https://ibqzsibltumbfklxdxof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_V_GQ8e4yyxXbOSPjuEkpEA_Sdg5zTnS';

// Supabase 리모컨 (모든 페이지에서 db로 사용)
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 학번 → 가짜 이메일 (가입, 로그인 모두 이 함수를 써야 같은 계정이 돼요)
function toEmail(studentId) {
    return `${studentId}@mirim-museum.com`;
}

// 글자를 HTML에 넣기 전에 안전하게 바꾸기
// (누가 제목에 <script> 같은 걸 써도 글자로만 보이게)
function escapeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

// 유물/화석 → 사진 필터용 CSS 클래스 이름
function filterClass(category) {
    return category === '유물' ? 'artifact' : 'fossil';
}

// 로그인이 필요한 페이지 맨 처음에 실행
// 로그인했으면 { id, studentId, name }을 돌려주고,
// 안 했으면 로그인 페이지로 보내요.
async function requireLogin() {
    const { data } = await db.auth.getSession();

    if (!data.session) {
        location.href = 'mirim_museum_LogIn.html';
        return null;
    }

    const userId = data.session.user.id;
    const { data: profile, error } = await db
        .from('profiles')
        .select('student_id, name')
        .eq('id', userId)
        .single();

    // 계정은 있는데 회원 정보가 없으면 (트리거 없을 때 만든 계정 등)
    if (error || !profile) {
        await db.auth.signOut();
        alert('회원 정보를 찾을 수 없어요. 다시 가입해주세요.');
        location.href = 'mirim_museum_SignIn.html';
        return null;
    }

    const me = { id: userId, studentId: profile.student_id, name: profile.name };
    showProfile(me);
    return me;
}

// 상단 프로필에 내 학번, 이름을 넣고, 누르면 로그아웃
function showProfile(me) {
    const mark = document.getElementById('profileMark');
    const name = document.getElementById('profileName');
    const button = document.getElementById('profileButton');

    if (mark) mark.textContent = me.name.charAt(0);
    if (name) name.textContent = `${me.studentId} ${me.name}`;

    if (button) {
        button.title = '누르면 로그아웃';
        button.addEventListener('click', async () => {
            if (!confirm('로그아웃할까요?')) return;
            await db.auth.signOut();
            location.href = 'mirim_museum.html';
        });
    }
}
