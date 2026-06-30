// ============================================================
// NeuroAlert dashboard logic
// Recalls=테이블 / Adverse events=단순목록 / FDA Alerts=피드(카드)
// nano X 토글 숨김 + 일본 저장 번역 + USEA 중복 분리
// ============================================================
let ALL_EVENTS = [];
let CURRENT_SRC = "ALL";
let CURRENT_TYPE = "recall";
let SEARCH_Q = "";
let DATE_FROM = null, DATE_TO = null;
let SHOW_EXCLUDED = false;

function isFdaAlert(e){ return String(e.raw_id||"").startsWith("USEA-"); }

function parseDate(raw){
  if(!raw) return null;
  const s = String(raw).trim();
  let m = s.match(/^(\d{4})-?(\d{2})-?(\d{2})/);
  if(m) return new Date(+m[1], +m[2]-1, +m[3]);
  m = s.match(/^(\d{4})/);
  if(m) return new Date(+m[1], 0, 1);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function fmtDate(raw){
  const d = parseDate(raw);
  if(!d) return "—";
  return d.toISOString().slice(0,10);
}
function setConn(state, key){
  const pill = document.getElementById("connPill");
  document.getElementById("connText").textContent = t(key);
  pill.className = "status-pill " + state;
}
function curLang(){ return (typeof LANG !== "undefined") ? LANG : "en"; }

async function loadEvents(){
  document.getElementById("status").textContent = t("js_loading");
  setConn("", "js_connecting");
  try{
    const res = await fetch(`${API_BASE}/api/events?limit=2000`);
    const data = await res.json();
    ALL_EVENTS = (data.events || []).map(e => ({...e, _date: parseDate(e.event_date)}));
    ALL_EVENTS.sort((a,b)=>{
      if(a._date && b._date) return b._date - a._date;
      if(a._date) return -1;
      if(b._date) return 1;
      return 0;
    });
    setConn("live", "js_live");
    window._totalCount = data.count ?? ALL_EVENTS.length;
    document.getElementById("statTotal").textContent = window._totalCount.toLocaleString();
    const srcCount = new Set(ALL_EVENTS.map(e=>e.source).filter(Boolean)).size;
    if(srcCount) document.getElementById("statSources").textContent = srcCount;
    const newest = ALL_EVENTS.find(e=>e._date);
    document.getElementById("statUpdated").textContent = newest ? fmtDate(newest.event_date) : "—";
    render();
  }catch(err){
    setConn("down", "js_off");
    document.getElementById("status").textContent = t("js_offline");
    document.getElementById("eventsBody").innerHTML = "";
  }
}

// ===== 일본 저장 번역 헬퍼 =====
function jpDevice(e){
  const lang = curLang();
  if(lang === "ko" && e.device_name_ko) return e.device_name_ko;
  if(e.device_name_en) return e.device_name_en;
  return e.device_name || "";
}
function jpReason(e){
  const lang = curLang();
  if(lang === "ko" && e.reason_ko) return e.reason_ko;
  if(e.reason_en) return e.reason_en;
  return e.reason || "";
}
function jpMaker(e){
  const lang = curLang();
  if(lang === "ko" && e.manufacturer_ko) return e.manufacturer_ko;
  if(e.manufacturer_en) return e.manufacturer_en;
  return "";
}
function jpPurpose(e){
  const lang = curLang();
  if(lang === "ko" && e.use_purpose_ko) return e.use_purpose_ko;
  if(e.use_purpose_en) return e.use_purpose_en;
  return e.use_purpose || "";
}

function getFiltered(){
  const wantFda = (CURRENT_TYPE === "fda_alert");
  return ALL_EVENTS.filter(e=>{
    const fa = isFdaAlert(e);
    // FDA Alerts 탭이면 USEA만, 그 외 탭이면 USEA 제외 (중복 방지)
    if(wantFda){
      if(!fa) return false;
    } else {
      if(fa) return false;
      if(CURRENT_TYPE!=="ALL" && (e.event_type||"recall")!==CURRENT_TYPE) return false;
    }
    if(!SHOW_EXCLUDED && e.neuro_verdict === "X") return false;
    if(CURRENT_SRC!=="ALL" && e.source!==CURRENT_SRC) return false;
    if(DATE_FROM && (!e._date || e._date < DATE_FROM)) return false;
    if(DATE_TO && (!e._date || e._date > DATE_TO)) return false;
    if(SEARCH_Q){
      const hay = ((e.device_name||"")+" "+(e.reason||"")+" "+(e.category||"")+" "+(e.source||"")
        +" "+(e.manufacturer||"")+" "+(e.product_name||"")
        +" "+(e.device_name_en||"")+" "+(e.device_name_ko||"")
        +" "+(e.manufacturer_en||"")+" "+(e.manufacturer_ko||"")
        +" "+(e.device_category||"")+" "+(e.reason_type||"")
        +" "+classLabel(e.device_category)+" "+classLabel(e.reason_type)).toLowerCase();
      if(!hay.includes(SEARCH_Q)) return false;
    }
    return true;
  });
}

let VISIBLE = 100;
const PAGE = 100;

function splitCompanyDevice(e){
  let company = "", device = e.device_name || "";
  if(e.source === "JP"){
    device = jpDevice(e);
    company = jpMaker(e) || String(e.manufacturer||"").split("製造販売業者")[0].trim();
    return { company, device };
  }
  if(e.manufacturer && String(e.manufacturer).trim()){
    company = String(e.manufacturer).split("製造販売業者")[0].trim();
  } else if((e.device_name||"").includes(" — ")){
    const parts = (e.device_name).split(" — ");
    company = parts[0].trim();
    device = parts.slice(1).join(" — ").trim();
  }
  return { company, device };
}

function groupKey(company, device, dateRaw){
  let d = device.toLowerCase()
    .replace(/^brand name:\s*/i, "")
    .replace(/model\/catalog number.*$/is, "")
    .replace(/catalog number.*$/is, "")
    .replace(/[^a-z가-힣ぁ-んァ-ン一-龥 ]+/g, " ")     // 영문/한글/일문 단어만, 숫자·단위·기호 전부 제거
    .split(/\s+/)
    .filter(w => w.length > 1 && !["mm","cm","fr","mx","mmx","ml","cs","otw","rx","lp","cmx","fx","cmmx"].includes(w))  // 단위 잔재 제거
    .join(" ").trim().slice(0, 40);
  const day = (dateRaw || "").slice(0, 10);
  return (day + "|" + company.toLowerCase().trim() + "|" + d);
}

function render(){
  const body = document.getElementById("eventsBody");
  const feed = document.getElementById("feedBody");
  const tableScroll = document.querySelector(".table-scroll");
  const status = document.getElementById("status");
  const list = getFiltered();
  body.innerHTML = "";
  feed.innerHTML = "";

  // 모드 결정
  const mode = (CURRENT_TYPE === "fda_alert") ? "feed"
             : (CURRENT_TYPE === "event") ? "events" : "recall";

  // 테이블/피드 토글
  feed.hidden = (mode !== "feed");
  if(tableScroll) tableScroll.style.display = (mode === "feed") ? "none" : "";

  if(list.length===0){
    status.textContent = t("js_none");
    document.getElementById("tableFoot").innerHTML="";
    return;
  }

  // ===== FDA Alerts 피드 (카드) =====
  if(mode === "feed"){
    status.textContent = t("js_showing",{n:list.length.toLocaleString()}) + " · " + t("js_fda_note");
    const shown = list.slice(0, VISIBLE);
    const frag = document.createDocumentFragment();
    shown.forEach(e=>{
      const isEA = (e.event_type === "early_alert");
      const card = document.createElement("div");
      card.className = "fda-card";
      // 이미지
      let imgHtml = "";
      if(e.image_url){
        imgHtml = '<div class="fda-img"><img src="'+esc(e.image_url)+'" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>';
      }
      // 상태 뱃지
      const badge = isEA
        ? '<span class="fda-badge ea">'+t("badge_ea")+'</span>'
        : '<span class="fda-badge recall">'+t("badge_recall_confirmed")+'</span>';
      // 분류 배지
      let classHtml = "";
      if(e.device_category && e.device_category !== "기타")
        classHtml += '<span class="class-badge cat">'+esc(classLabel(e.device_category))+'</span>';
      if(e.reason_type && e.reason_type !== "기타")
        classHtml += '<span class="class-badge rsn">'+esc(classLabel(e.reason_type))+'</span>';

      const reason = esc(e.reason||"");

      card.innerHTML =
        imgHtml +
        '<div class="fda-body">'+
          '<div class="fda-top">'+badge+'<span class="fda-date">'+fmtDate(e.event_date)+'</span></div>'+
          '<div class="fda-title">'+esc(e.device_name||"—")+'</div>'+
          (classHtml?'<div class="fda-badges">'+classHtml+'</div>':'')+
          '<div class="fda-reason">'+reason+'</div>'+
          '<div class="fda-detail" hidden>'+
            (e.use_purpose?'<div class="detail-field"><b>'+t("purpose_label")+':</b> '+esc(e.use_purpose)+'</div>':'')+
            (e.action_required?'<div class="detail-field"><b>'+t("action_label")+'</b> '+esc(e.action_required)+'</div>':'')+
            (e.detail_url?'<div class="detail-field"><a class="detail-link" href="'+esc(e.detail_url)+'" target="_blank" rel="noopener">'+t("detail_btn")+'</a></div>':'')+
          '</div>'+
          '<button class="fda-more">'+t("js_detail_hint")+' ▾</button>'+
        '</div>';
      const btn = card.querySelector(".fda-more");
      const det = card.querySelector(".fda-detail");
      btn.addEventListener("click",()=>{
        det.hidden = !det.hidden;
        btn.textContent = (det.hidden ? t("js_detail_hint") : t("js_detail_close")) + " ▾";
      });
      frag.appendChild(card);
    });
    feed.appendChild(frag);
    renderFoot(list.length);
    return;
  }

  // ===== 이상사례 단순 목록 =====
  if(mode === "events"){
    status.textContent = t("js_showing",{n:list.length.toLocaleString()}) + " · " + t("js_event_note");
    const shown = list.slice(0, VISIBLE);
    const frag = document.createDocumentFragment();
    shown.forEach(e=>{
      const {company, device} = splitCompanyDevice(e);
      const tr = document.createElement("tr");
      tr.className = "ev-row";
      tr.innerHTML =
        '<td class="col-src"><span class="src-flag '+(e.source||"").toLowerCase()+'">'+(e.source||"—")+'</span></td>'+
        '<td class="col-company">'+(esc(company)||"—")+'</td>'+
        '<td class="col-dev"><div class="dev-name">'+(esc(device)||"—")+'</div></td>'+
        '<td class="col-class"><span class="reason-text">'+(esc(e.reason)||"—")+'</span></td>'+
        '<td class="col-date">'+fmtDate(e.event_date)+'</td>';
      frag.appendChild(tr);
    });
    body.appendChild(frag);
    renderFoot(list.length);
    return;
  }

  // ===== 리콜 테이블 (묶기 + 펼침) =====
  status.textContent = t("js_showing",{n:list.length.toLocaleString()}) + " · " + t("js_newest");
  const groups = new Map();
  list.forEach(e=>{
    const {company, device} = splitCompanyDevice(e);
    const k = groupKey(company, device, e.event_date);
    if(!groups.has(k)) groups.set(k, {company, device, source:e.source, _date:e._date, items:[]});
    const g = groups.get(k);
    g.items.push({...e, _company:company, _device:device});
    if(e._date && (!g._date || e._date > g._date)){ g._date = e._date; g.device = device; }
  });
  const groupList = [...groups.values()].sort((a,b)=> (b._date||0)-(a._date||0));

  const shown = groupList.slice(0, VISIBLE);
  const frag = document.createDocumentFragment();
  shown.forEach((g)=>{
    const e0 = g.items[0];
    const src = (g.source||"").toLowerCase();
    const variantCount = g.items.length;
    let classHtml = "";
    if(e0.device_category && e0.device_category !== "기타")
      classHtml += '<span class="class-badge cat">'+esc(classLabel(e0.device_category))+'</span>';
    if(e0.reason_type && e0.reason_type !== "기타")
      classHtml += '<span class="class-badge rsn">'+esc(classLabel(e0.reason_type))+'</span>';

    const tr = document.createElement("tr");
    tr.className = "recall-row";
    tr.innerHTML =
      '<td class="col-src"><span class="src-flag '+src+'">'+(g.source||"—")+'</span></td>'+
      '<td class="col-company">'+(esc(g.company)||"—")+'</td>'+
      '<td class="col-dev"><div class="dev-name">'+(esc(g.device)||"—")+'</div>'+
        (variantCount>1?'<span class="variant-count">+'+(variantCount-1)+' '+t("js_variant")+'</span>':'')+
        '<span class="detail-hint">'+t("js_detail_hint")+'</span>'+
        '<span class="expand-caret">▾</span></td>'+
      '<td class="col-class">'+(classHtml||"—")+'</td>'+
      '<td class="col-date">'+fmtDate(g._date ? g._date.toISOString() : e0.event_date)+'</td>';

    const detailTr = document.createElement("tr");
    detailTr.className = "detail-row";
    detailTr.hidden = true;
    const rep = g.items[0];
    let _reason = (rep.source === "JP") ? jpReason(rep) : rep.reason;
    let _purpose = (rep.source === "JP") ? jpPurpose(rep) : rep.use_purpose;
    const noAction = "별도 안내 없음 (제조사 문의 요망)";
    let inner = '<td colspan="5"><div class="detail-box">';
    if(g.items.length > 1){
      inner += '<div class="detail-field"><b>'+t("affected_label")+' ('+g.items.length+')</b></div>';
      inner += '<ul class="variant-list">';
      g.items.forEach(it=>{
        let label = (it._device||"").replace(/^brand name:\s*/i,"").replace(/\s+/g," ").trim();
        inner += '<li>'+esc(label)+'</li>';
      });
      inner += '</ul>';
    }
    if(_reason)  inner += '<div class="detail-field"><b>'+t("reason_label")+':</b> '+esc(_reason)+'</div>';
    if(_purpose) inner += '<div class="detail-field"><b>'+t("purpose_label")+':</b> '+esc(_purpose)+'</div>';
    if(rep.license_no) inner += '<div class="detail-field"><b>'+t("license_label")+':</b> '+esc(rep.license_no)+'</div>';
    if(rep.category)   inner += '<div class="detail-field"><b>'+t("code_label")+':</b> <span data-tip="'+esc(codeInfo(rep.category))+'">'+esc(rep.category)+'</span></div>';
    if(rep.action_required && rep.action_required !== noAction && rep.source !== "JP")
      inner += '<div class="detail-field"><b>'+t("action_label")+'</b> '+esc(rep.action_required)+'</div>';
    if(rep.detail_url)
      inner += '<div class="detail-field"><a class="detail-link" href="'+esc(rep.detail_url)+'" target="_blank" rel="noopener">'+t("detail_btn")+'</a></div>';
    inner += '<div class="detail-date">'+fmtDate(rep.event_date)+'</div>';
    // 댓글 영역 (그룹키 기준)
    const _ckey = groupKey(g.company, g.device, g.items[0].event_date);
    inner += '<div class="recall-comments" data-ckey="'+esc(_ckey)+'"></div>';
    inner += '</div></td>';
    detailTr.innerHTML = inner;
    tr.addEventListener("click", ()=>{
      detailTr.hidden = !detailTr.hidden;
      tr.classList.toggle("expanded", !detailTr.hidden);
      if(!detailTr.hidden){
        const cc = detailTr.querySelector(".recall-comments");
        if(cc && !cc.dataset.loaded && typeof renderComments==="function"){
          cc.dataset.loaded="1";
          renderComments(cc, cc.dataset.ckey);
        }
      }
    });
    frag.appendChild(tr);
    frag.appendChild(detailTr);
  });
  body.appendChild(frag);
  renderFoot(groupList.length);
}

function renderFoot(total){
  const foot = document.getElementById("tableFoot");
  const remaining = total - VISIBLE;
  if(remaining > 0){
    const next = Math.min(PAGE, remaining);
    foot.innerHTML = '<button id="loadMore" class="load-more">'
      + t("js_loadmore",{n:next.toLocaleString()})
      + ' <span class="lm-sub">('+remaining.toLocaleString()+' '+t("js_remaining")+')</span></button>';
    document.getElementById("loadMore").addEventListener("click",()=>{ VISIBLE += PAGE; render(); });
  } else { foot.innerHTML = ""; }
}

function resetAndRender(){ VISIBLE = 100; render(); }

function esc(s){
  if(s==null) return "";
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

window.onLangChange = function(){
  if(ALL_EVENTS.length) render();
  const pill = document.getElementById("connPill");
  if(pill.classList.contains("live")) setConn("live","js_live");
  else if(pill.classList.contains("down")) setConn("down","js_off");
};


document.getElementById("sourceFilter").addEventListener("click",(e)=>{
  const btn=e.target.closest(".chip"); if(!btn) return;
  document.querySelectorAll("#sourceFilter .chip").forEach(c=>c.classList.remove("active"));
  btn.classList.add("active"); CURRENT_SRC=btn.dataset.src; resetAndRender();
});
document.getElementById("typeFilter").addEventListener("click",(e)=>{
  const btn=e.target.closest(".chip"); if(!btn) return;
  document.querySelectorAll("#typeFilter .chip").forEach(c=>c.classList.remove("active"));
  btn.classList.add("active"); CURRENT_TYPE=btn.dataset.type; resetAndRender();
});
let searchTimer;
document.getElementById("searchInput").addEventListener("input",(e)=>{
  clearTimeout(searchTimer);
  searchTimer = setTimeout(()=>{ SEARCH_Q=e.target.value.trim().toLowerCase(); resetAndRender(); }, 200);
});
document.getElementById("dateFrom").addEventListener("change",(e)=>{
  DATE_FROM = e.target.value ? new Date(e.target.value+"T00:00:00") : null; resetAndRender();
});
document.getElementById("dateTo").addEventListener("change",(e)=>{
  DATE_TO = e.target.value ? new Date(e.target.value+"T23:59:59") : null; resetAndRender();
});
document.getElementById("dateClear").addEventListener("click",()=>{
  DATE_FROM=DATE_TO=null;
  document.getElementById("dateFrom").value="";
  document.getElementById("dateTo").value="";
  resetAndRender();
});
const _excl = document.getElementById("showExcluded");
if(_excl) _excl.addEventListener("change",(e)=>{ SHOW_EXCLUDED = e.target.checked; resetAndRender(); });

loadEvents();

async function loadCounter(){
  const elT = document.getElementById("ccTotal");
  const elD = document.getElementById("ccToday");
  if(!elT) return;
  try{
    const res = await fetch(`${API_BASE}/api/visit`, {method:"POST"});
    const data = await res.json();
    if(typeof data.total === "number") elT.textContent = data.total.toLocaleString();
    if(typeof data.today === "number") elD.textContent = data.today.toLocaleString();
  }catch(e){
    const card = document.querySelector(".counter-card");
    if(card) card.style.display = "none";
  }
}
loadCounter();
