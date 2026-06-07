// ============================================================
// NeuroAlert i18n — UI label translations (EN / KO)
// Note: only UI labels are translated. Source data (device names,
// reasons) stays in its original language from each regulator.
// ============================================================
const I18N = {
  en: {
    nav_dashboard:"Dashboard", nav_about:"About", nav_method:"Methodology", nav_contact:"Contact",
    hero_eyebrow:"REGULATORY SIGNAL MONITOR",
    hero_title:"Global Neurovascular Device<br>Safety Surveillance",
    hero_sub:"Consolidated recall and adverse-event signals for neurointerventional devices — drawn from the U.S. FDA, Korea MFDS, Australia TGA, and Health Canada public post-market databases.",
    stat_records:"Tracked records", stat_sources:"Regulators", stat_updated:"Last updated",
    panel_title:"Recent Recall & Safety Events",
    panel_desc:"Most recent regulatory actions matching the neurovascular device whitelist.",
    search_ph:"Search device, manufacturer, or reason…",
    filter_all:"All", btn_refresh:"Refresh",
    type_all:"All", type_recall:"Recalls", type_event:"Adverse events",
    badge_recall:"Recall", badge_event:"Adverse event",
    date_range:"Date range", date_clear:"Clear",
    th_source:"Source", th_device:"Device / Description", th_code:"Code", th_reason:"Reason", th_date:"Date",
    sub_title:"Email Alerts",
    sub_desc:"Get notified when a new neurovascular device recall is detected.",
    sub_ph:"name@hospital.org", sub_btn:"Subscribe", sub_unsub:"Unsubscribe instead",
    unsub_ph:"Email to remove", unsub_btn:"Remove",
    alert_scope:"Alerts cover <strong>US, Korea, Australia &amp; Canada</strong> device recalls.",
    sub_fine:'Your email is used only to send alerts and is deleted immediately on unsubscribe. See our <a href="privacy.html">Privacy Policy</a>.',
    src_title:"Data Sources",
    src_us:"FDA openFDA — Recall & Event", src_kr:"MFDS — Medical Device Recall", src_au:"TGA DRAC — Device Recalls", src_ca:"Health Canada — Device Recalls",
    ref_badge:"reference", src_more:"How signals are filtered →",
    cov_title:"Data Coverage & Limits",
    cov_us:"Recalls + adverse events. Adverse events show only the most recent reports per category.",
    cov_kr:"Recall/withdrawal items only. No public adverse-event or detailed-reason data; product names are class-level.",
    cov_au:"Device recalls with manufacturer, product, reason, hazard class, and date.",
    cov_ca:"Device recalls with product, issue, recall class, and date.",
    cc_today:"Today",
    cc_total:"Total visits",
    disclaimer:"<strong>Informational use only.</strong> Counts reflect voluntary post-market reports and do not indicate incidence, device risk, or manufacturer quality. This dashboard is not a substitute for regulatory notices or clinical judgment.",
    foot_brand:"Global neurovascular device safety surveillance, aggregated from public regulatory data.",
    foot_site:"Site", foot_legal:"Legal", foot_data:"Data",
    foot_privacy:"Privacy Policy", foot_disclaimer:"Disclaimer",
    foot_copy:"© 2026 NeuroAlert. Data belongs to respective regulatory agencies.",
    foot_tag:"Built for clinical awareness, not clinical decisions.",
    // dynamic strings used by app.js
    js_loading:"Loading data…",
    js_offline:"⚠ Unable to reach the data service. The backend may be offline.",
    js_showing:"Showing {n} record(s)",
    js_newest:"newest first",
    js_none:"No records match your search.",
    js_loadmore:"Show {n} more",
    js_remaining:"remaining",
    action_label:"Action:",
    detail_btn:"View source detail →",
    js_live:"Live", js_connecting:"Connecting…", js_off:"Offline",
    js_sub_ok:"Subscribed.", js_sub_empty:"Please enter an email.",
    js_unsub_empty:"Enter the email to remove.", js_conn_fail:"Connection failed.",
    js_total_more:"of {total}"
  },
  ko: {
    nav_dashboard:"대시보드", nav_about:"소개", nav_method:"방법론", nav_contact:"문의",
    hero_eyebrow:"규제 안전성 신호 모니터",
    hero_title:"글로벌 신경중재 의료기기<br>안전성 모니터링",
    hero_sub:"신경중재 의료기기의 리콜·이상사례 신호를 미국 FDA, 한국 식약처(MFDS), 호주 TGA, 캐나다 보건부의 공개 사후감시 데이터에서 모아 한 화면에 보여줍니다.",
    stat_records:"수집 레코드", stat_sources:"규제기관", stat_updated:"최종 업데이트",
    panel_title:"최근 리콜·안전성 이벤트",
    panel_desc:"신경중재 기기 화이트리스트에 해당하는 최근 규제 조치입니다.",
    search_ph:"기기명, 제조사, 사유로 검색…",
    filter_all:"전체", btn_refresh:"새로고침",
    type_all:"전체", type_recall:"회수", type_event:"이상사례",
    badge_recall:"회수", badge_event:"이상사례",
    date_range:"기간", date_clear:"초기화",
    th_source:"출처", th_device:"기기 / 설명", th_code:"코드", th_reason:"사유", th_date:"일자",
    sub_title:"이메일 알림",
    sub_desc:"새로운 신경중재 기기 리콜이 감지되면 이메일로 알려드립니다.",
    sub_ph:"name@hospital.org", sub_btn:"구독", sub_unsub:"구독 해지하기",
    unsub_ph:"해지할 이메일", unsub_btn:"삭제",
    alert_scope:"알림은 <strong>미국·한국·호주·캐나다</strong> 의료기기 리콜을 발송합니다.",
    sub_fine:'입력하신 이메일은 알림 발송에만 사용되며, 구독 해지 시 즉시 완전히 삭제됩니다. <a href="privacy.html">개인정보처리방침</a>을 참고하세요.',
    src_title:"데이터 출처",
    src_us:"FDA openFDA — 리콜·이상사례", src_kr:"식약처 — 의료기기 회수", src_au:"TGA DRAC — 의료기기 회수", src_ca:"캐나다 보건부 — 의료기기 회수",
    ref_badge:"참고용", src_more:"신호 필터링 방식 보기 →",
    cov_title:"데이터 범위와 한계",
    cov_us:"리콜 + 이상사례. 이상사례는 분류별 최신 보고 일부만 표시합니다.",
    cov_kr:"회수·판매중지 품목만 제공. 공개 이상사례·상세 사유 없음. 품목명은 분류 수준.",
    cov_au:"제조사·제품·사유·위험등급·날짜가 포함된 의료기기 회수 정보.",
    cov_ca:"제품·사유·회수등급·날짜가 포함된 의료기기 회수 정보.",
    cc_today:"오늘",
    cc_total:"전체 방문",
    disclaimer:"<strong>정보 제공 목적입니다.</strong> 건수는 자발적 사후감시 보고를 반영하며, 발생률·기기 위험도·제조사 품질을 의미하지 않습니다. 본 대시보드는 규제 공지나 임상적 판단을 대체할 수 없습니다.",
    foot_brand:"공개 규제 데이터를 모은 글로벌 신경중재 의료기기 안전성 모니터입니다.",
    foot_site:"사이트", foot_legal:"법적 고지", foot_data:"데이터",
    foot_privacy:"개인정보처리방침", foot_disclaimer:"면책 고지",
    foot_copy:"© 2026 NeuroAlert. 데이터는 각 규제기관에 귀속됩니다.",
    foot_tag:"임상적 인지를 돕기 위한 것이며, 임상 결정 도구가 아닙니다.",
    js_loading:"데이터를 불러오는 중…",
    js_offline:"⚠ 데이터 서비스에 연결할 수 없습니다. 백엔드가 꺼져 있을 수 있습니다.",
    js_showing:"{n}건 표시",
    js_newest:"최신순",
    js_none:"검색 결과가 없습니다.",
    js_loadmore:"{n}개 더 보기",
    js_remaining:"남음",
    action_label:"조치:",
    detail_btn:"원본 상세 보기 →",
    js_live:"실시간", js_connecting:"연결 중…", js_off:"오프라인",
    js_sub_ok:"구독되었습니다.", js_sub_empty:"이메일을 입력하세요.",
    js_unsub_empty:"해지할 이메일을 입력하세요.", js_conn_fail:"연결에 실패했습니다.",
    js_total_more:"/ 총 {total}건"
  }
};

let LANG = localStorage_get("neuroalert_lang") || "en";

function localStorage_get(k){ try{return localStorage.getItem(k);}catch(e){return null;} }
function localStorage_set(k,v){ try{localStorage.setItem(k,v);}catch(e){} }

function t(key, vars){
  let s = (I18N[LANG] && I18N[LANG][key]) || (I18N.en[key]) || key;
  if(vars) for(const k in vars) s = s.replace("{"+k+"}", vars[k]);
  return s;
}

function applyI18n(){
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    el.innerHTML = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  // toggle active button
  document.querySelectorAll("#langToggle button").forEach(b=>{
    b.classList.toggle("active", b.dataset.lang===LANG);
  });
  document.body.classList.toggle("lang-ko", LANG==="ko");
  // toggle long-form content blocks on legal/about pages
  document.querySelectorAll(".lang-en").forEach(el=>{ el.hidden = (LANG!=="en"); });
  document.querySelectorAll(".lang-ko").forEach(el=>{ el.hidden = (LANG!=="ko"); });
  // let app.js re-render dynamic parts if it's loaded
  if(window.onLangChange) window.onLangChange();
}

function setLang(lang){
  LANG = lang;
  localStorage_set("neuroalert_lang", lang);
  applyI18n();
}

document.addEventListener("DOMContentLoaded", ()=>{
  const tg = document.getElementById("langToggle");
  if(tg) tg.addEventListener("click", e=>{
    const b = e.target.closest("button[data-lang]");
    if(b) setLang(b.dataset.lang);
  });
  applyI18n();
});

// ============================================================
// FDA product code + Korea class explanations (for tooltips)
// ============================================================
const CODE_INFO = {
  en: {
    "OUT": "Flow diverter — diverts blood flow away from an intracranial aneurysm",
    "HCG": "Embolization coil — fills/occludes an aneurysm or vessel",
    "KRD": "Embolization-promoting device (coil-related)",
    "NRY": "Thrombus retriever catheter — removes clots in acute stroke",
    "NIM": "Carotid artery stent",
    "NJE": "Intracranial neurovascular stent",
    "NTE": "Carotid embolic capture / protection device",
    "MFE": "Injectable embolic agent (liquid embolic)",
    "QCA": "Coil-assist (stent-assisted coiling) stent",
    "POL": "Mechanical thrombectomy device (acute stroke)",
    "DQY": "Percutaneous catheter (neurovascular brands only)",
    "Class I": "Australia TGA hazard class — Class I: highest risk, may cause death or serious injury",
    "Class II": "Australia TGA hazard class — Class II: moderate risk, may cause temporary or reversible injury",
    "Class III": "Australia TGA hazard class — Class III: lowest risk, unlikely to cause injury",
    "Type I": "Health Canada recall class — Type I: highest risk, reasonable probability of serious harm or death",
    "Type II": "Health Canada recall class — Type II: moderate risk, may cause temporary or reversible harm",
    "Type III": "Health Canada recall class — Type III: lowest risk, unlikely to cause harm"
  },
  ko: {
    "OUT": "플로우 다이버터 — 두개내 동맥류에서 혈류를 우회시키는 기기",
    "HCG": "색전 코일 — 동맥류나 혈관을 채워 막는 기기",
    "KRD": "색전 촉진 기기 (코일 계열)",
    "NRY": "혈전제거 카테터 — 급성 뇌졸중에서 혈전을 제거",
    "NIM": "경동맥 스텐트",
    "NJE": "두개내 신경혈관 스텐트",
    "NTE": "경동맥 색전 포착/보호 기구",
    "MFE": "주입형 색전물질 (액상 색전)",
    "QCA": "코일 보조(스텐트 보조 코일링) 스텐트",
    "POL": "기계적 혈전절제 기기 (급성 뇌졸중)",
    "DQY": "경피적 카테터 (신경중재 브랜드만 포함)",
    "Class I": "호주 TGA 위험등급 — Class I: 최고 위험, 사망·중상 유발 가능",
    "Class II": "호주 TGA 위험등급 — Class II: 중간 위험, 일시적·회복 가능한 손상 유발 가능",
    "Class III": "호주 TGA 위험등급 — Class III: 최저 위험, 손상 가능성 낮음",
    "Type I": "캐나다 보건부 회수등급 — Type I: 최고 위험, 심각한 위해·사망 가능성 있음",
    "Type II": "캐나다 보건부 회수등급 — Type II: 중간 위험, 일시적·회복 가능한 위해 가능",
    "Type III": "캐나다 보건부 회수등급 — Type III: 최저 위험, 위해 가능성 낮음"
  }
};
function codeInfo(code){
  if(!code) return "";
  const lang = (typeof LANG !== "undefined") ? LANG : "en";
  if(CODE_INFO[lang] && CODE_INFO[lang][code]) return CODE_INFO[lang][code];
  if(CODE_INFO.en[code]) return CODE_INFO.en[code];
  // 한국 품목분류코드 패턴 (A12345.06 처럼 영문+숫자.숫자)
  const isKoreaCode = /^[A-Z]\d{4,5}(\.\d+)?$/.test(code);
  if(isKoreaCode){
    return (lang==="ko")
      ? "한국 식약처 의료기기 품목분류코드 (품목명은 기기 설명 참고)"
      : "Korea MFDS device class code (see device name for description)";
  }
  // 그 외 알 수 없는 코드
  return (lang==="ko")
    ? "분류 코드 (기기 설명 참고)"
    : "Classification code (see device description)";
}

// ===== 분류 라벨 양국어 사전 (DB는 한글 저장, 화면은 토글 따라) =====
const CLASS_LABELS = {
  // device_category
  "플로우다이버터": {en:"Flow Diverter", ko:"플로우다이버터"},
  "색전코일": {en:"Embolization Coil", ko:"색전코일"},
  "혈전제거": {en:"Thrombectomy", ko:"혈전제거"},
  "스텐트": {en:"Stent", ko:"스텐트"},
  "카테터·가이드와이어": {en:"Catheter / Guidewire", ko:"카테터·가이드와이어"},
  "색전물질": {en:"Embolic Agent", ko:"색전물질"},
  "두개내압모니터": {en:"ICP Monitor", ko:"두개내압모니터"},
  // reason_type
  "제조결함": {en:"Manufacturing Defect", ko:"제조결함"},
  "멸균문제": {en:"Sterility Issue", ko:"멸균문제"},
  "성능저하": {en:"Performance Issue", ko:"성능저하"},
  "라벨링·표시": {en:"Labeling", ko:"라벨링·표시"},
  "재질·부품": {en:"Material / Component", ko:"재질·부품"},
  "설계결함": {en:"Design Defect", ko:"설계결함"},
  "기타": {en:"Other", ko:"기타"}
};
function classLabel(val){
  if(!val) return "";
  const lang = (typeof LANG !== "undefined") ? LANG : "en";
  if(CLASS_LABELS[val]) return CLASS_LABELS[val][lang] || val;
  return val;
}
