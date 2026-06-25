// ============================================================
// NeuroAlert dashboard logic (search + date range + i18n)
// Recalls = grouped + expandable / Adverse events = simple list
// ============================================================
let ALL_EVENTS = [];
let CURRENT_SRC = "ALL";
let CURRENT_TYPE = "recall";
let SEARCH_Q = "";
let DATE_FROM = null, DATE_TO = null;

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

function getFiltered(){
  return ALL_EVENTS.filter(e=>{
    if(CURRENT_SRC!=="ALL" && e.source!==CURRENT_SRC) return false;
    if(CURRENT_TYPE!=="ALL" && (e.event_type||"recall")!==CURRENT_TYPE) return false;
    if(DATE_FROM && (!e._date || e._date < DATE_FROM)) return false;
    if(DATE_TO && (!e._date || e._date > DATE_TO)) return false;
    if(SEARCH_Q){
      const hay = ((e.device_name||"")+" "+(e.reason||"")+" "+(e.category||"")+" "+(e.source||"")
        +" "+(e.manufacturer||"")+" "+(e.product_name||"")
        +" "+(e.device_category||"")+" "+(e.reason_type||"")
        +" "+classLabel(e.device_category)+" "+classLabel(e.reason_type)).toLowerCase();
      if(!hay.includes(SEARCH_Q)) return false;
    }
    return true;
  });
}

let VISIBLE = 100;  // 현재 보여주는 개수
const PAGE = 100;   // 더 보기 단위

function splitCompanyDevice(e){
  let company = "", device = e.device_name || "";
  if(e.manufacturer && String(e.manufacturer).trim()){
    // 회사 컬럼이 있으면 그걸 사용 (US / CA / JP)
    company = String(e.manufacturer).split("製造販売業者")[0].trim();
    device = e.device_name || "";
  } else if(device.includes(" — ")){
    // 회사가 기기명에 "—"로 붙은 경우 (KR / AU)
    const parts = device.split(" — ");
    company = parts[0].trim();
    device = parts.slice(1).join(" — ").trim();
  }
  return { company, device };
}

// 변형 묶기 키 (같은 날짜 + 회사 + 제품명 뿌리. 사이즈/모델만 다른 것끼리)
function groupKey(company, device, dateRaw){
  const root = device.toLowerCase()
    .replace(/\b\d+(\.\d+)?\s*(fr|f|mm|cm|g|ga|inch|in)\b/g," ")  // 사이즈 토큰
    .replace(/[\d.,/()×x]+/g," ")                                // 숫자·기호
    .replace(/\s+/g," ").trim().slice(0,40);
  const day = (dateRaw||"").slice(0,10);                         // 날짜(일 단위)
  return (day+"|"+company.toLowerCase()+"|"+root);
}

function render(){
  const body = document.getElementById("eventsBody");
  const status = document.getElementById("status");
  const list = getFiltered();
  body.innerHTML = "";
  if(list.length===0){ status.textContent = t("js_none"); document.getElementById("tableFoot").innerHTML=""; return; }

  const isRecall = (CURRENT_TYPE !== "event");

  // ===== 이상사례(MAUDE) 모드: 단순 목록, 펼침 없음 =====
  if(!isRecall){
    status.textContent = t("js_showing",{n:list.length.toLocaleString()}) + " · " + t("js_event_note","이상사례 신고 (회수 아님)");
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

  // ===== 리콜 모드: 회사+제품 묶기 + 클릭 펼침 =====
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
        (variantCount>1?'<span class="variant-count">+'+(variantCount-1)+' '+t("js_variant","변형")+'</span>':'')+
        '<span class="detail-hint">'+t("js_detail_hint","상세 보기")+'</span>'+
        '<span class="expand-caret">▾</span></td>'+
      '<td class="col-class">'+(classHtml||"—")+'</td>'+
      '<td class="col-date">'+fmtDate(g._date ? g._date.toISOString() : e0.event_date)+'</td>';

    const detailTr = document.createElement("tr");
    detailTr.className = "detail-row";
    detailTr.hidden = true;
    let inner = '<td colspan="5"><div class="detail-box">';
    g.items.forEach(it=>{
      inner += '<div class="detail-item">';
      inner += '<div class="detail-dev">'+(esc(it._device)||"—")+'</div>';
      if(it.reason)      inner += '<div class="detail-field"><b>'+t("reason_label","사유")+':</b> '+esc(it.reason)+'</div>';
      if(it.use_purpose) inner += '<div class="detail-field"><b>'+t("purpose_label","용도")+':</b> '+esc(it.use_purpose)+'</div>';
      if(it.license_no)  inner += '<div class="detail-field"><b>'+t("license_label","허가번호")+':</b> '+esc(it.license_no)+'</div>';
      if(it.category)    inner += '<div class="detail-field"><b>'+t("code_label","코드")+':</b> <span data-tip="'+esc(codeInfo(it.category))+'">'+esc(it.category)+'</span></div>';
      const noAction = "별도 안내 없음 (제조사 문의 요망)";
      if(it.action_required && it.action_required !== noAction)
        inner += '<div class="detail-field"><b>'+t("action_label")+'</b> '+esc(it.action_required)+'</div>';
      if(it.detail_url)
        inner += '<div class="detail-field"><a class="detail-link" href="'+esc(it.detail_url)+'" target="_blank" rel="noopener">'+t("detail_btn")+'</a></div>';
      inner += '<div class="detail-date">'+fmtDate(it.event_date)+'</div>';
      inner += '</div>';
    });
    inner += '</div></td>';
    detailTr.innerHTML = inner;

    tr.addEventListener("click", ()=>{
      detailTr.hidden = !detailTr.hidden;
      tr.classList.toggle("expanded", !detailTr.hidden);
    });
    frag.appendChild(tr);
    frag.appendChild(detailTr);
  });
  body.appendChild(frag);
  renderFoot(groupList.length);
}

// 더보기 버튼 (리콜=그룹수, 이상사례=건수)
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

// 필터/검색 바뀌면 100개부터 다시 시작
function resetAndRender(){ VISIBLE = 100; render(); }

function esc(s){
  if(s==null) return "";
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// re-render dynamic text when language changes
window.onLangChange = function(){
  if(ALL_EVENTS.length) render();
  const pill = document.getElementById("connPill");
  if(pill.classList.contains("live")) setConn("live","js_live");
  else if(pill.classList.contains("down")) setConn("down","js_off");
};

async function subscribe(){
  const email = document.getElementById("subEmail").value.trim();
  const msg = document.getElementById("subMsg");
  if(!email){ showMsg(msg,t("js_sub_empty"),"error"); return; }
  try{
    const res = await fetch(`${API_BASE}/api/subscribe`,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const data = await res.json();
    showMsg(msg, data.message || t("js_sub_ok"), "success");
    document.getElementById("subEmail").value="";
  }catch(err){ showMsg(msg,t("js_conn_fail"),"error"); }
}
async function unsubscribe(){
  const email = document.getElementById("unsubEmail").value.trim();
  const msg = document.getElementById("subMsg");
  if(!email){ showMsg(msg,t("js_unsub_empty"),"error"); return; }
  try{
    const res = await fetch(`${API_BASE}/api/unsubscribe`,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const data = await res.json();
    showMsg(msg, data.message || "OK", "success");
    document.getElementById("unsubEmail").value="";
  }catch(err){ showMsg(msg,t("js_conn_fail"),"error"); }
}
function showMsg(el,text,type){ el.textContent=text; el.className="msg "+type; }

// ---- wire up ----
document.getElementById("subBtn").addEventListener("click", subscribe);
document.getElementById("unsubBtn").addEventListener("click", unsubscribe);
document.getElementById("refreshBtn").addEventListener("click", loadEvents);
document.getElementById("unsubToggle").addEventListener("click", ()=>{
  const box=document.getElementById("unsubBox"); box.hidden=!box.hidden;
});
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

loadEvents();

// ============================================================
// Visitor counter — our own backend (privacy-friendly, counts only)
// ============================================================
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
