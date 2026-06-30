// ============================================================
// NeuroAlert 회원/댓글 프론트 — members.js
// index.html에서 app.js 뒤에 <script src="members.js"></script>
// 기존 구독카드를 회원카드로 교체, 가입/로그인 모달, 댓글
// ============================================================
const TOKEN_KEY = "neuroalert_token";
let ME = null;  // 로그인된 회원 정보

function authToken(){ try{return localStorage.getItem(TOKEN_KEY);}catch(e){return null;} }
function setToken(t){ try{t?localStorage.setItem(TOKEN_KEY,t):localStorage.removeItem(TOKEN_KEY);}catch(e){} }
function authHeaders(){ const t=authToken(); return t?{"Authorization":"Bearer "+t}:{}; }

const REGIONS = ["수도권","강원","충청","호남","영남","제주","해외"];
const ORG_TYPES = ["상급종합병원","종합병원","병원","의원","의료기기업체","대학·연구기관","기타"];
const POSITIONS = ["영상의학전문의","신경외과전문의","신경과전문의","전공의","간호사","방사선사","임상연구","의료기기 RA·QA","의료기기 영업","기타"];

// ---------- 회원 상태 로드 ----------
async function loadMe(){
  const t = authToken();
  if(!t){ ME=null; renderMemberCard(); return; }
  try{
    const r = await fetch(`${API_BASE}/api/auth/me`, {headers:authHeaders()});
    if(r.ok){ ME = await r.json(); }
    else { setToken(null); ME=null; }
  }catch(e){ ME=null; }
  renderMemberCard();
}

// ---------- 회원 카드 (구독카드 자리) ----------
function renderMemberCard(){
  const card = document.getElementById("memberCard");
  if(!card) return;
  if(!ME){
    card.innerHTML = `
      <h3>${mt("member_title","회원")}</h3>
      <p>${mt("member_desc","의료진·업계 전문가 회원제입니다. 가입하면 기기 리콜 알림을 받고, 임상 경험을 댓글로 공유할 수 있습니다.")}</p>
      <div class="mem-btns">
        <button class="btn-primary" id="openLogin">${mt("login","로그인")}</button>
        <button class="btn-secondary" id="openSignup">${mt("signup","회원가입")}</button>
      </div>`;
    document.getElementById("openLogin").onclick = ()=>openModal("login");
    document.getElementById("openSignup").onclick = ()=>openModal("signup");
  } else {
    const badge = ME.verified
      ? `<span class="mem-badge verified">${mt("verified","기관 인증")}</span>`
      : `<span class="mem-badge unverified">${mt("unverified","미인증")}</span>`;
    // 안내: 도메인은 기관인데 메일확인만 안 한 경우 vs 개인메일
    let confirmWarn = "";
    if(!ME.email_confirmed){
      confirmWarn = `<p class="mem-warn">${mt("confirm_warn","이메일 인증 미완료 — 메일함의 인증 링크를 클릭하면 기관 인증이 완료됩니다.")}</p>`;
    } else if(!ME.verified && ME.verified_domain===false){
      confirmWarn = `<p class="mem-warn">${mt("personal_warn","개인 이메일로 가입되어 '미인증' 상태입니다. CONTACT의 관리자 이메일로 재직 증명서를 보내시면 기관 인증으로 전환됩니다.")}</p>`;
    }
    card.innerHTML = `
      <h3>${mt("member_title","회원")}</h3>
      <div class="mem-me">
        <div class="mem-name">${esc(ME.display_name)} ${badge}</div>
        ${ME.role==="admin"?`<a href="admin.html" class="mem-admin">${mt("admin_panel","관리자")}</a>`:""}
      </div>
      ${confirmWarn}
      <label class="mem-toggle">
        <input type="checkbox" id="notifyToggle" ${ME.notify_email?"checked":""}>
        <span>${mt("notify_label","새 리콜 이메일 알림 받기")}</span>
      </label>
      <button class="link-btn" id="myComments">${mt("my_comments","내가 쓴 댓글")}</button>
      <div id="myCommentsList" class="my-comments" hidden></div>
      <button class="link-btn logout" id="logoutBtn">${mt("logout","로그아웃")}</button>`;
    document.getElementById("notifyToggle").onchange = async (e)=>{
      await fetch(`${API_BASE}/api/auth/notify`,{method:"POST",
        headers:{"Content-Type":"application/json",...authHeaders()},
        body:JSON.stringify({notify_email:e.target.checked?1:0})});
      ME.notify_email = e.target.checked;
    };
    document.getElementById("myComments").onclick = toggleMyComments;
    document.getElementById("logoutBtn").onclick = ()=>{ setToken(null); ME=null; renderMemberCard(); };
  }
}

async function toggleMyComments(){
  const box = document.getElementById("myCommentsList");
  if(!box.hidden){ box.hidden=true; return; }
  box.hidden=false; box.innerHTML = `<p class="muted">${mt("loading","불러오는 중…")}</p>`;
  try{
    const r = await fetch(`${API_BASE}/api/comments/mine`,{headers:authHeaders()});
    const d = await r.json();
    if(!d.comments.length){ box.innerHTML=`<p class="muted">${mt("no_comments","작성한 댓글이 없습니다.")}</p>`; return; }
    box.innerHTML = d.comments.map(c=>`
      <div class="my-cmt" data-key="${esc(c.recall_key)}">
        <div class="my-cmt-body">${esc(c.body).slice(0,80)}${c.body.length>80?"…":""}</div>
        <div class="my-cmt-date">${esc(c.created_at)}</div>
      </div>`).join("");
    box.querySelectorAll(".my-cmt").forEach(el=>{
      el.onclick = ()=> goToRecall(el.dataset.key);
    });
  }catch(e){ box.innerHTML=`<p class="muted">오류</p>`; }
}

// 내 댓글 클릭 → 해당 건으로 (검색창에 키 넣어 필터)
function goToRecall(key){
  // recall_key가 그룹키라 정확매칭 어려우니, 검색으로 유도
  const si = document.getElementById("searchInput");
  if(si){ si.value = key.split("|").pop() || key; si.dispatchEvent(new Event("input")); }
  document.querySelector(".panel")?.scrollIntoView({behavior:"smooth"});
}

// ---------- 모달 ----------
function openModal(mode){
  closeModal();
  const ov = document.createElement("div");
  ov.className="mem-overlay"; ov.id="memOverlay";
  ov.innerHTML = `<div class="mem-modal">
    <button class="mem-close" id="memClose">×</button>
    <div class="mem-tabs">
      <button class="mem-tab ${mode==='login'?'active':''}" data-m="login">${mt("login","로그인")}</button>
      <button class="mem-tab ${mode==='signup'?'active':''}" data-m="signup">${mt("signup","회원가입")}</button>
    </div>
    <div id="memForm"></div>
    <p id="memMsg" class="mem-msg"></p>
  </div>`;
  document.body.appendChild(ov);
  document.getElementById("memClose").onclick = closeModal;
  ov.onclick = (e)=>{ if(e.target===ov) closeModal(); };
  ov.querySelectorAll(".mem-tab").forEach(b=> b.onclick=()=>renderForm(b.dataset.m));
  renderForm(mode);
}
function closeModal(){ document.getElementById("memOverlay")?.remove(); }
function msg(t,err){ const m=document.getElementById("memMsg"); if(m){m.textContent=t; m.className="mem-msg "+(err?"err":"ok");} }

function renderForm(mode){
  document.querySelectorAll(".mem-tab").forEach(b=>b.classList.toggle("active",b.dataset.m===mode));
  const f = document.getElementById("memForm");
  if(mode==="login"){
    f.innerHTML = `
      <input type="email" id="li_email" placeholder="${mt("email","이메일")}">
      <input type="password" id="li_pw" placeholder="${mt("password","비밀번호")}">
      <button class="btn-primary full" id="li_btn">${mt("login","로그인")}</button>`;
    document.getElementById("li_btn").onclick = doLogin;
  } else {
    f.innerHTML = `
      <input type="email" id="su_email" placeholder="${mt("email_inst","이메일 (기관 이메일 권장)")}">
      <input type="password" id="su_pw" placeholder="${mt("password_min","비밀번호 (6자 이상)")}">
      <div class="mem-row">
        ${sel("su_region", mt("region","지역"), REGIONS)}
        ${sel("su_org", mt("org_type","기관 유형"), ORG_TYPES)}
      </div>
      ${sel("su_pos", mt("position","직군"), POSITIONS)}
      <input type="text" id="su_company" placeholder="${mt("org_company","소속 기관/회사명 (비공개·인증용)")}">
      <label class="mem-toggle"><input type="checkbox" id="su_notify" checked> <span>${mt("notify_label","새 리콜 이메일 알림 받기")}</span></label>
      <p class="mem-fine">${mt("signup_fine","표시는 '지역 · 기관유형 · 직군'까지만 공개되며 기관명은 비공개입니다. 기관·회사 이메일로 가입하면 자동으로 '기관 인증'됩니다. 개인 이메일(gmail, naver 등)로 가입하거나 기관 메일이 없는 경우 '미인증'으로 표시되며, CONTACT 페이지의 관리자 이메일로 재직 증명서(재직증명서·사원증·명함 등)를 보내주시면 '기관 인증'으로 전환해 드립니다.")}</p>
      <button class="btn-primary full" id="su_btn">${mt("signup","회원가입")}</button>`;
    document.getElementById("su_btn").onclick = doSignup;
  }
  msg("");
}
function sel(id,label,opts){
  return `<select id="${id}"><option value="">${label}</option>`+
    opts.map(o=>`<option value="${o}">${o}</option>`).join("")+`</select>`;
}

async function doLogin(){
  const email=document.getElementById("li_email").value.trim();
  const pw=document.getElementById("li_pw").value;
  if(!email||!pw){ msg(mt("fill_all","모두 입력하세요."),true); return; }
  try{
    const r = await fetch(`${API_BASE}/api/auth/login`,{method:"POST",
      headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pw})});
    const d = await r.json();
    if(!r.ok){ msg(d.detail||mt("login_fail","로그인 실패"),true); return; }
    setToken(d.token); ME=d.member; closeModal(); renderMemberCard();
  }catch(e){ msg(mt("conn_fail","연결 실패"),true); }
}

async function doSignup(){
  const email=document.getElementById("su_email").value.trim();
  const pw=document.getElementById("su_pw").value;
  const region=document.getElementById("su_region").value;
  const org_type=document.getElementById("su_org").value;
  const position=document.getElementById("su_pos").value;
  const org_company=document.getElementById("su_company").value.trim();
  const notify=document.getElementById("su_notify").checked?1:0;
  if(!email||!pw){ msg(mt("need_email_pw","이메일과 비밀번호는 필수입니다."),true); return; }
  if(pw.length<6){ msg(mt("pw_min","비밀번호는 6자 이상입니다."),true); return; }
  try{
    const r = await fetch(`${API_BASE}/api/auth/signup`,{method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,password:pw,region,org_type,position,org_company,notify_email:notify})});
    const d = await r.json();
    if(!r.ok){ msg(d.detail||mt("signup_fail","가입 실패"),true); return; }
    msg(d.message||mt("signup_ok","가입 완료! 인증 메일을 확인하세요."),false);
    setTimeout(()=>renderForm("login"), 2500);
  }catch(e){ msg(mt("conn_fail","연결 실패"),true); }
}

// ---------- 댓글 (펼침 상세 안에 삽입) ----------
async function renderComments(container, recallKey){
  container.innerHTML = `<div class="cmt-loading">${mt("loading","불러오는 중…")}</div>`;
  let list=[];
  try{
    const r = await fetch(`${API_BASE}/api/comments?recall_key=${encodeURIComponent(recallKey)}`);
    const d = await r.json(); list=d.comments||[];
  }catch(e){}
  let html = `<div class="cmt-head">${mt("comments","댓글")} <span class="cmt-count">${list.length}</span></div>`;
  html += `<div class="cmt-list">`;
  if(!list.length) html += `<div class="cmt-empty">${mt("cmt_empty","첫 댓글을 남겨보세요.")}</div>`;
  list.forEach(c=>{
    const badge = c.verified?`<span class="cmt-badge">${mt("verified","기관 인증")}</span>`:"";
    const canDel = ME && (ME.id===c.member_id || ME.role==="admin");
    html += `<div class="cmt-item">
      <div class="cmt-meta"><span class="cmt-author">${esc(c.display_name)}</span>${badge}
        <span class="cmt-date">${esc(c.created_at)}</span>
        ${canDel?`<button class="cmt-del" data-id="${c.id}">${mt("delete","삭제")}</button>`:""}</div>
      <div class="cmt-body">${esc(c.body)}</div></div>`;
  });
  html += `</div>`;
  // 입력
  if(ME){
    html += `<div class="cmt-form">
      <textarea id="cmtInput_${recallKey}" placeholder="${mt("cmt_ph","임상 경험·추가 정보를 공유해주세요…")}"></textarea>
      <button class="btn-primary" id="cmtSend_${recallKey}">${mt("post","등록")}</button></div>`;
  } else {
    html += `<div class="cmt-login-hint">${mt("cmt_login","댓글을 작성하려면 로그인이 필요합니다.")}
      <button class="link-btn" onclick="openModal('login')">${mt("login","로그인")}</button></div>`;
  }
  container.innerHTML = html;
  // 이벤트
  container.querySelectorAll(".cmt-del").forEach(b=> b.onclick=async()=>{
    if(!confirm(mt("del_confirm","삭제하시겠습니까?"))) return;
    await fetch(`${API_BASE}/api/comments/${b.dataset.id}`,{method:"DELETE",headers:authHeaders()});
    renderComments(container, recallKey);
  });
  const send = document.getElementById(`cmtSend_${recallKey}`);
  if(send) send.onclick = async()=>{
    const ta = document.getElementById(`cmtInput_${recallKey}`);
    const body = ta.value.trim(); if(!body) return;
    const r = await fetch(`${API_BASE}/api/comments`,{method:"POST",
      headers:{"Content-Type":"application/json",...authHeaders()},
      body:JSON.stringify({recall_key:recallKey, body})});
    if(r.ok){ ta.value=""; renderComments(container, recallKey); }
    else { const d=await r.json(); alert(d.detail||"오류"); }
  };
}

// i18n 헬퍼 (members 전용 — 기존 t()와 별도로 안전하게)
const MEM_I18N = { ko:{}, en:{
  member_title:"Members", member_desc:"A membership for clinicians and industry experts. Get recall alerts and share clinical experience in comments.",
  login:"Log in", signup:"Sign up", verified:"Verified", unverified:"Unverified",
  confirm_warn:"Email not confirmed — check the verification link in your inbox.",
  notify_label:"Email me about new recalls", my_comments:"My comments", logout:"Log out",
  admin_panel:"Admin", email:"Email", password:"Password", email_inst:"Email (institutional preferred)",
  password_min:"Password (6+ chars)", region:"Region", org_type:"Organization type", position:"Role",
  org_company:"Institution/company (private, for verification)",
  signup_fine:"Only 'region · org type · role' is shown publicly; your institution name stays private. Institutional/company emails are auto-verified. Personal-email accounts (gmail, etc.) or those without an institutional email show as 'Unverified' — send proof of affiliation (employment certificate, ID badge, business card) to the admin email on the CONTACT page to be upgraded to 'Verified'.",
  fill_all:"Please fill in all fields.", login_fail:"Login failed", conn_fail:"Connection failed",
  need_email_pw:"Email and password are required.", pw_min:"Password must be 6+ characters.",
  signup_fail:"Signup failed", signup_ok:"Signed up! Check your verification email.",
  comments:"Comments", cmt_empty:"Be the first to comment.", cmt_ph:"Share clinical experience or additional info…",
  post:"Post", cmt_login:"Log in to comment.", delete:"Delete", del_confirm:"Delete this?",
  loading:"Loading…", no_comments:"No comments yet."
}};
function mt(key, ko){
  const lang = (typeof LANG!=="undefined")?LANG:"ko";
  if(lang==="en" && MEM_I18N.en[key]) return MEM_I18N.en[key];
  return ko;
}

// 언어 바뀌면 회원카드 다시
const _origOnLang = window.onLangChange;
window.onLangChange = function(){ if(_origOnLang) _origOnLang(); renderMemberCard(); };

// 초기화
loadMe();
