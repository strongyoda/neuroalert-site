// ============================================================
// NeuroAlert dashboard logic (search + date range + i18n)
// ============================================================
let ALL_EVENTS = [];
let CURRENT_SRC = "ALL";
let CURRENT_TYPE = "ALL";
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
      const hay = ((e.device_name||"")+" "+(e.reason||"")+" "+(e.category||"")+" "+(e.source||"")).toLowerCase();
      if(!hay.includes(SEARCH_Q)) return false;
    }
    return true;
  });
}

function render(){
  const body = document.getElementById("eventsBody");
  const status = document.getElementById("status");
  const foot = document.getElementById("tableFoot");
  const list = getFiltered();
  body.innerHTML = "";
  if(list.length===0){ status.textContent = t("js_none"); foot.textContent=""; return; }
  status.textContent = t("js_showing",{n:list.length.toLocaleString()}) + " · " + t("js_newest");
  // cap render to 200 rows for performance; note the rest
  const shown = list.slice(0,200);
  const frag = document.createDocumentFragment();
  shown.forEach(e=>{
    const tr = document.createElement("tr");
    const src = (e.source||"").toLowerCase();
    const et = (e.event_type||"recall");
    const typeBadge = '<span class="type-badge '+et+'">'+t(et==="event"?"badge_event":"badge_recall")+'</span>';
    tr.innerHTML =
      '<td class="col-src"><span class="src-flag '+src+'">'+(e.source||"—")+'</span></td>'+
      '<td class="col-dev"><div class="dev-name">'+(esc(e.device_name)||"—")+'</div>'+typeBadge+'</td>'+
      '<td class="col-code">'+(e.category?'<span class="code-badge" data-tip="'+esc(codeInfo(e.category))+'">'+esc(e.category)+'</span>':"—")+'</td>'+
      '<td class="col-reason"><div class="reason-text">'+(esc(e.reason)||"—")+'</div></td>'+
      '<td class="col-date"><span class="date-cell">'+fmtDate(e.event_date)+'</span></td>';
    frag.appendChild(tr);
  });
  body.appendChild(frag);
  foot.textContent = list.length>200 ? ("… "+(list.length-200).toLocaleString()+" more") : "";
}

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
  btn.classList.add("active"); CURRENT_SRC=btn.dataset.src; render();
});
document.getElementById("typeFilter").addEventListener("click",(e)=>{
  const btn=e.target.closest(".chip"); if(!btn) return;
  document.querySelectorAll("#typeFilter .chip").forEach(c=>c.classList.remove("active"));
  btn.classList.add("active"); CURRENT_TYPE=btn.dataset.type; render();
});
let searchTimer;
document.getElementById("searchInput").addEventListener("input",(e)=>{
  clearTimeout(searchTimer);
  searchTimer = setTimeout(()=>{ SEARCH_Q=e.target.value.trim().toLowerCase(); render(); }, 200);
});
document.getElementById("dateFrom").addEventListener("change",(e)=>{
  DATE_FROM = e.target.value ? new Date(e.target.value+"T00:00:00") : null; render();
});
document.getElementById("dateTo").addEventListener("change",(e)=>{
  DATE_TO = e.target.value ? new Date(e.target.value+"T23:59:59") : null; render();
});
document.getElementById("dateClear").addEventListener("click",()=>{
  DATE_FROM=DATE_TO=null;
  document.getElementById("dateFrom").value="";
  document.getElementById("dateTo").value="";
  render();
});

loadEvents();

// ============================================================
// Visitor counter — privacy-friendly (counts only, no personal data)
// Uses a free hit counter API; fails silently if unreachable.
// ============================================================
async function loadCounter(){
  const elT = document.getElementById("ccTotal");
  const elD = document.getElementById("ccToday");
  if(!elT) return;
  const NS = "neuroalert_live";
  try{
    // total visits (increment once per page load)
    const tot = await fetch(`https://api.countapi.xyz/hit/${NS}/total`).then(r=>r.json());
    if(tot && typeof tot.value === "number") elT.textContent = tot.value.toLocaleString();
    // today's visits (key by date, increments)
    const day = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const tod = await fetch(`https://api.countapi.xyz/hit/${NS}/d${day}`).then(r=>r.json());
    if(tod && typeof tod.value === "number") elD.textContent = tod.value.toLocaleString();
  }catch(e){
    // counter is non-critical; hide if it fails
    const card = document.querySelector(".counter-card");
    if(card) card.style.display = "none";
  }
}
loadCounter();
