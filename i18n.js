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
    hero_sub:"Consolidated recall and adverse-event signals for neurointerventional devices — drawn from the U.S. FDA, Korea MFDS, and Japan PMDA public post-market databases.",
    stat_records:"Tracked records", stat_sources:"Regulators", stat_updated:"Last updated",
    panel_title:"Recent Recall & Safety Events",
    panel_desc:"Most recent regulatory actions matching the neurovascular device whitelist.",
    search_ph:"Search device, manufacturer, or reason…",
    filter_all:"All", btn_refresh:"Refresh",
    date_range:"Date range", date_clear:"Clear",
    th_source:"Source", th_device:"Device / Description", th_code:"Code", th_reason:"Reason", th_date:"Date",
    sub_title:"Email Alerts",
    sub_desc:"Get notified when a new neurovascular device recall is detected.",
    sub_ph:"name@hospital.org", sub_btn:"Subscribe", sub_unsub:"Unsubscribe instead",
    unsub_ph:"Email to remove", unsub_btn:"Remove",
    alert_scope:"Alerts cover <strong>US &amp; Korea</strong> recalls. Japan data is reference-only and not included in alerts.",
    sub_fine:'Your email is used only to send alerts and is deleted immediately on unsubscribe. See our <a href="privacy.html">Privacy Policy</a>.',
    src_title:"Data Sources",
    src_us:"FDA openFDA — Recall & Event", src_kr:"MFDS — Medical Device Recall", src_jp:"PMDA — JAMDER Cases",
    ref_badge:"reference", src_more:"How signals are filtered →",
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
    js_live:"Live", js_connecting:"Connecting…", js_off:"Offline",
    js_sub_ok:"Subscribed.", js_sub_empty:"Please enter an email.",
    js_unsub_empty:"Enter the email to remove.", js_conn_fail:"Connection failed.",
    js_total_more:"of {total}"
  },
  ko: {
    nav_dashboard:"대시보드", nav_about:"소개", nav_method:"방법론", nav_contact:"문의",
    hero_eyebrow:"규제 안전성 신호 모니터",
    hero_title:"글로벌 신경중재 의료기기<br>안전성 모니터링",
    hero_sub:"신경중재 의료기기의 리콜·이상사례 신호를 미국 FDA, 한국 식약처(MFDS), 일본 PMDA의 공개 사후감시 데이터에서 모아 한 화면에 보여줍니다.",
    stat_records:"수집 레코드", stat_sources:"규제기관", stat_updated:"최종 업데이트",
    panel_title:"최근 리콜·안전성 이벤트",
    panel_desc:"신경중재 기기 화이트리스트에 해당하는 최근 규제 조치입니다.",
    search_ph:"기기명, 제조사, 사유로 검색…",
    filter_all:"전체", btn_refresh:"새로고침",
    date_range:"기간", date_clear:"초기화",
    th_source:"출처", th_device:"기기 / 설명", th_code:"코드", th_reason:"사유", th_date:"일자",
    sub_title:"이메일 알림",
    sub_desc:"새로운 신경중재 기기 리콜이 감지되면 이메일로 알려드립니다.",
    sub_ph:"name@hospital.org", sub_btn:"구독", sub_unsub:"구독 해지하기",
    unsub_ph:"해지할 이메일", unsub_btn:"삭제",
    alert_scope:"알림은 <strong>미국·한국</strong> 리콜만 발송됩니다. 일본 데이터는 참고용이며 알림에 포함되지 않습니다.",
    sub_fine:'입력하신 이메일은 알림 발송에만 사용되며, 구독 해지 시 즉시 완전히 삭제됩니다. <a href="privacy.html">개인정보처리방침</a>을 참고하세요.',
    src_title:"데이터 출처",
    src_us:"FDA openFDA — 리콜·이상사례", src_kr:"식약처 — 의료기기 회수", src_jp:"PMDA — JAMDER 증례",
    ref_badge:"참고용", src_more:"신호 필터링 방식 보기 →",
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
