/* ============================================================
   SRC Password Security Checker – standalone, 100% client-side
   ============================================================ */

/* ---------- Blocklists ---------- */
const COMMON = new Set(["geslo","password","passwort","qwerty","asdf","123456","12345678","123456789","1234567890",
"111111","000000","abc123","admin","welcome","letmein","iloveyou","dragon","monkey","master","login","guest","user",
"sunshine","princess","football","superman","batman","trustno1","1q2w3e","zaq12wsx","qwertz","slovenija","ljubljana",
"maribor","triglav","novak","olimpija","doncic","pogacar","roglic","test","pivo","sonce","luna","geslo123","slo123",
"celje","kranj","koper","piran","bled","morje","gora","kava","zmaga","domovina","secret","computer","internet"]);
const SEQ = ["abcdefghijklmnopqrstuvwxyz","qwertzuiopasdfghjklyxcvbnm","qwertyuiopasdfghjklzxcvbnm","0123456789"];
const LEET = {a:"@4",e:"3",i:"1!",o:"0",s:"$5",t:"7",l:"1",b:"8",g:"9"};

/* ---------- Char pool ---------- */
function poolSize(pw){
  let s=0;
  if(/[a-z]/.test(pw)) s+=26;
  if(/[A-Z]/.test(pw)) s+=26;
  if(/[0-9]/.test(pw)) s+=10;
  if(/[^a-zA-Z0-9]/.test(pw)) s+=33;
  if(/[^\x00-\x7F]/.test(pw)) s+=40;
  return Math.max(s,1);
}
function normalize(pw){
  let s=pw.toLowerCase();
  for(const k in LEET){ for(const ch of LEET[k]) s=s.split(ch).join(k); }
  return s;
}
function hasSequence(pw){
  const low=pw.toLowerCase();
  for(const seq of SEQ){
    for(let i=0;i+3<=seq.length;i++){
      const frag=seq.slice(i,i+4);
      if(low.includes(frag)) return true;
      if(low.includes(frag.split("").reverse().join(""))) return true;
    }
  }
  return false;
}
function hasRepeat(pw){ return /(.)\1{2,}/.test(pw); }
function looksLikeYear(pw){ return /(19|20)\d{2}/.test(pw); }
function isDictionary(pw){
  const n=normalize(pw);
  if(COMMON.has(n)) return "exact";
  for(const w of COMMON){ if(w.length>=4 && n.includes(w)) return "contains"; }
  return null;
}

/* ---------- Personal data check ---------- */
function personalHit(pw){
  if(!pw) return null;
  const low=pw.toLowerCase();
  const norm=normalize(pw);
  const fields=[
    ["ime", (document.getElementById("pName")||{}).value],
    ["priimek", (document.getElementById("pSurname")||{}).value],
    ["vzdevek", (document.getElementById("pNick")||{}).value],
    ["letnico rojstva", (document.getElementById("pBirth")||{}).value],
  ];
  for(const [label,raw] of fields){
    const v=(raw||"").trim().toLowerCase();
    if(v.length>=3 && (low.includes(v)||norm.includes(normalize(v)))) return label;
  }
  return null;
}

/* ---------- Core model ---------- */
function analyze(pw){
  const len=pw.length;
  const counts={
    lower:(pw.match(/[a-z]/g)||[]).length,
    upper:(pw.match(/[A-Z]/g)||[]).length,
    num:(pw.match(/[0-9]/g)||[]).length,
    spec:(pw.match(/[^a-zA-Z0-9]/g)||[]).length,
  };
  const pool=poolSize(pw);
  let baseEntropy = len>0 ? len*Math.log2(pool) : 0;
  const weaknesses=[]; let penalty=0;

  const dict=isDictionary(pw);
  if(dict==="exact"){ penalty+=baseEntropy*0.85; weaknesses.push("common"); }
  else if(dict==="contains"){ penalty+=Math.min(baseEntropy*0.35,14); weaknesses.push("dictword"); }

  if(hasSequence(pw)){ penalty+=Math.min(baseEntropy*0.25,10); weaknesses.push("sequence"); }
  if(hasRepeat(pw)){ penalty+=Math.min(baseEntropy*0.2,8); weaknesses.push("repeat"); }
  if(looksLikeYear(pw)){ penalty+=4; weaknesses.push("year"); }
  if(len>0 && len<8){ penalty+=6; weaknesses.push("short"); }
  const classes=[counts.lower>0,counts.upper>0,counts.num>0,counts.spec>0].filter(Boolean).length;
  if(classes<=1 && len>0){ penalty+=Math.min(baseEntropy*0.15,6); }

  const pers=personalHit(pw);
  if(pers){ penalty+=Math.min(baseEntropy*0.5,20); weaknesses.push("personal"); }

  let eff=Math.max(baseEntropy-penalty, 0);
  if(len===0) eff=0;
  const guesses = len? Math.pow(2, eff)/2 : 0;

  let score;
  if(eff<28) score=0; else if(eff<36) score=1; else if(eff<60) score=2; else if(eff<128) score=3; else score=4;
  if(dict==="exact"||pers) score=Math.min(score,1);

  return {len,counts,pool,baseEntropy,eff,guesses,score,weaknesses,classes,pers};
}

/* ---------- Scenarios ---------- */
const SCENARIOS=[
  {key:"online_throttled", ico:"🌐", name:"Spletni napad (omejen)", sub:"npr. prijavni obrazec, ~100/s", rate:100},
  {key:"online_fast", ico:"⚡", name:"Spletni napad (hiter)", sub:"brez omejitev, ~10 tisoč/s", rate:1e4},
  {key:"offline_slow", ico:"🖥️", name:"Offline (počasen hash)", sub:"bcrypt/argon2, ~10 tisoč/s", rate:1e4},
  {key:"offline_gpu", ico:"🎮", name:"Offline GPU (hiter hash)", sub:"MD5/SHA1, ~100 milijard/s", rate:1e11},
  {key:"offline_farm", ico:"🏭", name:"Napadalec z mnogo GPU", sub:"gruča, ~10 bilijonov/s", rate:1e13},
];
function fmtTime(sec){
  if(sec<1e-3) return "trenutno";
  if(sec<1) return "manj kot sekunda";
  const units=[["stoletij",3155760000],["let",31557600],["mesecev",2629800],["dni",86400],["ur",3600],["minut",60],["sekund",1]];
  if(sec>3155760000*100){ const cent=sec/3155760000; if(cent>1e6) return "praktično nerazbitno"; return Math.round(cent).toLocaleString("sl")+" stoletij"; }
  for(const [label,s] of units){ if(sec>=s){ const v=Math.floor(sec/s); return v.toLocaleString("sl")+" "+label; } }
  return "trenutno";
}
function timeColor(sec){
  if(sec<3600) return "var(--bad)";
  if(sec<86400*30) return "var(--warn)";
  if(sec<31557600*100) return "var(--mid)";
  return "var(--ok)";
}

/* ---------- Checklist ---------- */
function checklist(a){
  return [
    {ok:a.len>=12, label:"Vsaj 12 znakov"},
    {ok:a.len>=16, label:"16+ znakov (priporočeno)"},
    {ok:a.counts.upper>0 && a.counts.lower>0, label:"Male in velike črke"},
    {ok:a.counts.num>0, label:"Vsebuje številke"},
    {ok:a.counts.spec>0, label:"Vsebuje posebne znake"},
    {ok:!a.weaknesses.includes("common") && !a.weaknesses.includes("dictword"), label:"Ni v seznamu pogostih gesel"},
    {ok:!a.weaknesses.includes("sequence") && !a.weaknesses.includes("repeat"), label:"Brez zaporedij / ponavljanj"},
    {ok:!a.weaknesses.includes("personal") && !a.weaknesses.includes("year"), label:"Brez osebnih podatkov / letnic"},
  ];
}

/* ---------- Recommendations ---------- */
function recommend(a){
  if(a.len===0) return [];
  const r=[];
  if(a.weaknesses.includes("personal")) r.push({ic:"👤",t:"Geslo vsebuje vaše osebne podatke ("+a.pers+"). Osebni podatki so med prvimi, ki jih napadalec preizkusi – odstranite jih.",danger:true});
  if(a.weaknesses.includes("common")) r.push({ic:"🚨",t:"To je eno najpogostejših gesel na svetu. Napadalec ga preizkusi med prvimi – takoj ga zamenjajte.",danger:true});
  if(a.weaknesses.includes("dictword")) r.push({ic:"📖",t:"Geslo vsebuje pogosto besedo iz slovarja (tudi z zamenjavo črk s številkami, npr. @ za a). Napadalci te vzorce poznajo."});
  if(a.len<12) r.push({ic:"📏",t:"Podaljšajte geslo na vsaj 12–16 znakov. Dolžina prispeva k varnosti bolj kot kompleksnost."});
  if(a.counts.upper===0||a.counts.lower===0) r.push({ic:"🔠",t:"Mešajte male in velike črke."});
  if(a.counts.num===0) r.push({ic:"🔢",t:"Dodajte nekaj številk (a ne le na koncu)."});
  if(a.counts.spec===0) r.push({ic:"✳️",t:"Dodajte posebne znake (npr. ! ? # % &)."});
  if(a.weaknesses.includes("sequence")) r.push({ic:"➡️",t:"Izogibajte se zaporedjem tipk in črk (abc, 123, qwertz)."});
  if(a.weaknesses.includes("repeat")) r.push({ic:"🔁",t:"Izogibajte se ponavljajočim se znakom (aaa, 111)."});
  if(a.weaknesses.includes("year")) r.push({ic:"📅",t:"Ne uporabljajte letnic ali rojstnih datumov."});
  if(r.length===0){
    r.push({ic:"✅",t:"Odlično – to je močno geslo.",good:true});
    r.push({ic:"🗝️",t:"Za maksimalno varnost uporabite upravitelja gesel in za vsak račun drugačno geslo.",good:true});
    r.push({ic:"📱",t:"Kjer je mogoče, vklopite dvostopenjsko avtentikacijo (2FA).",good:true});
  } else {
    r.push({ic:"💡",t:"Namig: geslo-fraza iz več naključnih besed (npr. »konj-baterija-modra-postelja«) je enostavna za pomnjenje in zelo močna. Uporabite generator zgoraj.",good:true});
  }
  return r;
}

/* ---------- Achievements ---------- */
const BADGES=[
  {id:"len12", e:"📏", t:"12+ znakov", test:a=>a.len>=12},
  {id:"len20", e:"📐", t:"20+ znakov", test:a=>a.len>=20},
  {id:"allclass", e:"🎨", t:"Vse vrste znakov", test:a=>a.classes===4},
  {id:"nodict", e:"🛡️", t:"Ni slovarsko", test:a=>a.len>0 && !a.weaknesses.includes("common") && !a.weaknesses.includes("dictword")},
  {id:"entropy", e:"🔥", t:"80+ bitov entropije", test:a=>a.eff>=80},
  {id:"fortress", e:"🏰", t:"Trdnjava (ocena 4)", test:a=>a.score===4},
];

/* ---------- Rendering ---------- */
const $=id=>document.getElementById(id);
const VERDICTS=[{t:"Zelo šibko",c:"var(--bad)"},{t:"Šibko",c:"var(--bad)"},{t:"Zmerno",c:"var(--warn)"},{t:"Močno",c:"var(--mid)"},{t:"Zelo močno",c:"var(--ok)"}];
let LAST=null;

function render(pw){
  const a=analyze(pw); LAST=a;
  $("sLen").textContent=a.len; $("sLow").textContent=a.counts.lower; $("sUp").textContent=a.counts.upper;
  $("sNum").textContent=a.counts.num; $("sSpec").textContent=a.counts.spec; $("sEnt").textContent=Math.round(a.eff);

  const v=VERDICTS[a.score]; const fill=$("fill");
  fill.style.width=(a.len? (a.score+1)*20 : 0)+"%"; fill.style.background=v.c;
  if(a.len===0){ $("verdict").textContent="Vnesite geslo…"; $("verdict").style.color="var(--muted)"; $("verdictSub").textContent=""; }
  else { $("verdict").textContent=v.t; $("verdict").style.color=v.c; $("verdictSub").textContent="ocena "+a.score+"/4 · ~"+Math.round(a.eff)+" bitov"; }

  const scen=$("scen"); scen.innerHTML="";
  if(a.len===0){ scen.innerHTML='<div class="subtle">Vnesite geslo za oceno časa razbitja.</div>'; }
  else { for(const s of SCENARIOS){ const sec=a.guesses/s.rate; const row=document.createElement("div"); row.className="scenrow";
      row.innerHTML=`<div class="l"><span class="ico">${s.ico}</span><span class="name"><b>${s.name}</b><span>${s.sub}</span></span></div><span class="time" style="color:${timeColor(sec)}">${fmtTime(sec)}</span>`;
      scen.appendChild(row); } }

  const cl=checklist(a); const cbox=$("checks"); cbox.innerHTML="";
  for(const c of cl){ const d=document.createElement("div"); d.className="chk "+(c.ok?"pass":(a.len?"fail":""));
    d.innerHTML=`<span class="mark">${c.ok?"✓":(a.len?"✕":"")}</span><span>${c.label}</span>`; cbox.appendChild(d); }

  const recs=recommend(a); const rbox=$("recs"); rbox.innerHTML="";
  if(recs.length===0){ rbox.innerHTML='<li class="subtle" style="border:0;background:none">Vnesite geslo za predloge.</li>'; }
  for(const r of recs){ const li=document.createElement("li"); if(r.good) li.className="good"; if(r.danger) li.className="danger";
    li.innerHTML=`<span class="ic">${r.ic}</span><span>${r.t}</span>`; rbox.appendChild(li); }

  const abox=$("ach"); abox.innerHTML="";
  for(const b of BADGES){ const on=a.len>0 && b.test(a); const d=document.createElement("div"); d.className="badge "+(on?"on":"");
    d.innerHTML=`<span class="e">${b.e}</span><span>${b.t}</span>`; abox.appendChild(d); }
}

/* ---------- Generator ---------- */
function secureInt(max){ const arr=new Uint32Array(1); const limit=Math.floor(4294967296/max)*max; let x; do{ crypto.getRandomValues(arr); x=arr[0]; }while(x>=limit); return x%max; }
function pick(str){ return str[secureInt(str.length)]; }
function genPassword(){
  const len=+$("lenRange").value; let sets=[]; const amb=$("optAmb").checked;
  let U="ABCDEFGHIJKLMNOPQRSTUVWXYZ", L="abcdefghijklmnopqrstuvwxyz", N="0123456789", S="!@#$%^&*-_=+?";
  if(amb){ U=U.replace(/[IO]/g,""); L=L.replace(/[lo]/g,""); N=N.replace(/[01]/g,""); }
  if($("optUpper").checked) sets.push(U); if($("optLower").checked) sets.push(L);
  if($("optNum").checked) sets.push(N); if($("optSym").checked) sets.push(S);
  if(sets.length===0) sets.push(L);
  const all=sets.join(""); let out=[];
  for(const s of sets) out.push(pick(s));
  while(out.length<len) out.push(pick(all));
  for(let i=out.length-1;i>0;i--){ const j=secureInt(i+1); [out[i],out[j]]=[out[j],out[i]]; }
  return out.slice(0,len).join("");
}
const WORDS=["jabolko","gora","reka","modra","postelja","konj","baterija","oblak","zvezda","kamen","veter","ogenj",
"snops","lisica","hrast","zvon","most","luna","sonce","srce","kolo","knjiga","kava","dežnik","gozd","morje","pesek",
"tiger","riba","ptica","cvet","list","koren","zima","poletje","sever","jug","mesec","polje","hiša","vrata","okno",
"ura","zemlja","nebo","dolina","otok","jezero","slap","mavrica","kompas","sidro","perje","megla","iskra","valj"];
function genPassphrase(){
  const n=+$("wordsRange").value; const cap=$("phCap").checked, num=$("phNum").checked; let words=[];
  for(let i=0;i<n;i++){ let w=WORDS[secureInt(WORDS.length)]; if(cap) w=w.charAt(0).toUpperCase()+w.slice(1); words.push(w); }
  let out=words.join("-"); if(num) out+="-"+secureInt(100); return out;
}
let genMode="password";
function generate(){ const val=genMode==="password"?genPassword():genPassphrase(); $("genField").value=val; return val; }

/* ---------- PDF report (via print, no password included) ---------- */
function exportPDF(){
  const a=LAST||analyze("");
  if(a.len===0){ toast("Najprej vnesite geslo"); return; }
  const v=VERDICTS[a.score];
  const rows=SCENARIOS.map(s=>{ const sec=a.guesses/s.rate; return `<tr><td>${s.name}</td><td>${s.sub}</td><td style="font-weight:700">${fmtTime(sec)}</td></tr>`; }).join("");
  const recs=recommend(a).map(r=>`<li>${r.t}</li>`).join("");
  const now=new Date().toLocaleString("sl");
  const html=`<!doctype html><html lang="sl"><head><meta charset="utf-8"><title>Poročilo o varnosti gesla – SRC</title>
  <style>body{font-family:Arial,sans-serif;color:#111;margin:40px;line-height:1.5}
  h1{color:#0086bd;font-size:22px} h2{font-size:15px;margin-top:24px;border-bottom:2px solid #0086bd;padding-bottom:4px}
  .badge{display:inline-block;padding:6px 14px;border-radius:20px;color:#fff;font-weight:700}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
  td,th{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f1f6fb}
  .muted{color:#666;font-size:12px} ul{font-size:13px} .stat{display:inline-block;margin-right:16px;font-size:13px}
  .foot{margin-top:30px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:10px}</style></head>
  <body onload="window.print()">
  <h1>🔒 Poročilo o varnosti gesla</h1>
  <p class="muted">SRC d.o.o. – Oddelek za kibernetsko varnost · ${now}</p>
  <p>To poročilo <b>ne vsebuje analiziranega gesla</b>. Vsebuje le rezultat ocene.</p>
  <h2>Ocena</h2>
  <p><span class="badge" style="background:${v.c.replace('var(--bad)','#f85149').replace('var(--warn)','#d29922').replace('var(--mid)','#db8b2c').replace('var(--ok)','#3fb950')}">${v.t} (${a.score}/4)</span></p>
  <p class="stat">Dolžina: <b>${a.len}</b></p><p class="stat">Entropija: <b>${Math.round(a.eff)} bitov</b></p>
  <p class="stat">Male/velike/številke/posebni: <b>${a.counts.lower}/${a.counts.upper}/${a.counts.num}/${a.counts.spec}</b></p>
  <h2>Ocena časa razbitja</h2>
  <table><tr><th>Scenarij napada</th><th>Predpostavka</th><th>Čas</th></tr>${rows}</table>
  <h2>Priporočila</h2><ul>${recs}</ul>
  <div class="foot">Ocena je informativna, izračunana lokalno v brskalniku na podlagi entropije in prepoznanih vzorcev. SRC d.o.o.</div>
  </body></html>`;
  const w=window.open("","_blank");
  if(!w){ toast("Dovolite pojavna okna za PDF"); return; }
  w.document.write(html); w.document.close();
}

/* ---------- Events ---------- */
$("pw").addEventListener("input",e=>render(e.target.value));
["pName","pSurname","pNick","pBirth"].forEach(id=>{ const el=$(id); if(el) el.addEventListener("input",()=>render($("pw").value)); });
$("toggleVis").addEventListener("click",()=>{ const f=$("pw"); f.type=f.type==="password"?"text":"password"; });
$("clearBtn").addEventListener("click",()=>{ $("pw").value=""; render(""); $("pw").focus(); });
$("lenRange").addEventListener("input",e=>$("lenLabel").textContent="Dolžina: "+e.target.value);
$("wordsRange").addEventListener("input",e=>$("wordsLabel").textContent="Besede: "+e.target.value);
document.querySelectorAll("#modeSeg button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("#modeSeg button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); genMode=b.dataset.mode;
  $("pwOpts").classList.toggle("hidden",genMode!=="password");
  $("phOpts").classList.toggle("hidden",genMode!=="passphrase");
}));
$("genBtn").addEventListener("click",generate);
$("copyBtn").addEventListener("click",async()=>{ const val=$("genField").value||generate();
  try{ await navigator.clipboard.writeText(val); toast("Kopirano ✓"); }
  catch{ $("genField").select(); document.execCommand("copy"); toast("Kopirano ✓"); } });
$("useGen").addEventListener("click",()=>{ const val=$("genField").value||generate();
  $("pw").value=val; $("pw").type="text"; render(val); document.querySelector(".card").scrollIntoView({behavior:"smooth"}); });
$("pdfBtn").addEventListener("click",exportPDF);
function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1600); }

$("themeBtn").addEventListener("click",()=>{ const cur=document.documentElement.getAttribute("data-theme");
  const next=cur==="light"?"dark":(cur==="dark"?"light":"light"); document.documentElement.setAttribute("data-theme",next);
  try{ localStorage.setItem("src_pw_theme",next); }catch{} });
try{ const saved=localStorage.getItem("src_pw_theme"); if(saved) document.documentElement.setAttribute("data-theme",saved); }catch{}

render(""); generate();

/* ============================================================
   Izobraževalni popup – social-engineering awareness
   Sproži se 20 s po PRVEM vpisu v polje geslo. Prikaže se enkrat.
   Geslo se NIKAMOR ne shrani in ne pošlje – prikaže se le lokalno.
   ============================================================ */
(function(){
  const DELAY_MS = 20000;      // 20 sekund
  let timer = null;
  let shown = false;
  const pwEl = $("pw");
  const overlay = $("eduOverlay");
  if(!pwEl || !overlay) return;

  function showEdu(){
    if(shown) return;
    shown = true;
    const pw = pwEl.value || "(prazno)";
    // Geslo se prikaže SAMO v tem oknu (v pomnilniku brskalnika), nikjer se ne shrani.
    $("eduPw").textContent = pw;
    overlay.hidden = false;
    const btn = $("eduClose"); if(btn) btn.focus();
  }
  function closeEdu(){ overlay.hidden = true; }

  // Timer se zažene ob prvem vpisu (prvem pritisku tipke) v polje geslo.
  pwEl.addEventListener("input", function startOnce(){
    if(timer || shown) return;
    timer = setTimeout(showEdu, DELAY_MS);
  });

  $("eduClose").addEventListener("click", closeEdu);
  overlay.addEventListener("click", e=>{ if(e.target===overlay) closeEdu(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !overlay.hidden) closeEdu(); });
})();
