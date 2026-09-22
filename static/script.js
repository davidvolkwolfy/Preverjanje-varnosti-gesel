/* ============================================================
   SRC Password Security Checker – 2-step wizard, i18n (SL/EN)
   100% client-side. Ne shranjuje in ne pošilja gesel.
   ============================================================ */
const $=id=>document.getElementById(id);

/* ---------- i18n ---------- */
const I18N={
 sl:{
  title:"Kako varno je vaše geslo? 🔒",
  lead:'Vnesite geslo in dobite oceno moči, konkretne predloge ter realističen čas razbitja. Vse se izračuna <b>lokalno v vašem brskalniku</b> – geslo nikoli ne zapusti te naprave.',
  step1:"Vnos in analiza", step2:"Rezultati",
  enterPw:"Vpišite geslo za analizo", phStart:"Začnite tipkati…", enterPrompt:"Vnesite geslo…",
  cLen:"Znaki",cLow:"Male",cUp:"Velike",cNum:"Številke",cSpec:"Posebni",cEnt:"Entropija",
  policyTitle:"🏛️ Politika gesel organizacije (neobvezno)",
  policyDesc:"Preverite geslo proti pravilom vaše organizacije.",
  polMinLen:"Najmanjša dolžina",polUpper:"Velike črke",polLower:"Male črke",polNum:"Številke",polSym:"Posebni znaki",polNoCommon:"Ni pogosto geslo",
  polPass:"Geslo USTREZA politiki",polFail:"Geslo NE ustreza politiki",
  genTitle:"Generator močnih gesel",genPw:"Naključno geslo",genPhrase:"Geslo-fraza",
  optAmb:"Izpusti dvoumne",phCap:"Velika začetnica",phNum:"Dodaj številko",
  phGen:"Kliknite Ustvari…",btnGen:"Ustvari",btnCopy:"Kopiraj",btnUse:"Uporabi za analizo",
  genPrivacy:"🔐 Uporablja kriptografsko varen vir naključja (crypto.getRandomValues).",
  next:"Naprej: rezultati →",back:"Nazaj",
  resultTitle:"Kontrolni seznam, priporočila in dosežki",checklist:"Kontrolni seznam",recs:"Priporočila",ach:"Dosežki",
  crackTitle:"Ocena časa razbitja",crackDesc:"Koliko časa bi napadalec potreboval za razbitje pri realističnih hitrostih strojne opreme.",
  vizTitle:"Vpliv dolžine na čas razbitja",vizDesc:"Vsak dodaten znak eksponentno podaljša čas razbitja (offline GPU napad). Vaša dolžina je označena.",
  cmpTitle:"Primerjava dveh gesel",cmpAph:"Geslo A",cmpBph:"Geslo B",
  btnPdf:"Prenesi poročilo (PDF)",
  footPrivacy:"🔐 Ta stran ne shranjuje in ne pošilja vaših gesel. Vsa obdelava poteka lokalno v brskalniku.",
  footBy:"Projekt razvija Oddelek za kibernetsko varnost <b>SRC d.o.o.</b> · Namenjeno ozaveščanju in izobraževanju.",
  eduTitle:"Izobraževalno opozorilo · SRC d.o.o.",eduOops:"UPS!",eduLine1a:"Vaše geslo",eduLine1b:"je bilo pravkar »zabeleženo in poslano napadalcu«.",
  eduLine2:"Ampak pisalo je, da se ne beleži? Točno tako – nasedli ste taktiki socialnega inženiringa. To je bil preizkus. Vaše geslo ni bilo nikamor shranjeno ali poslano.",
  eduLesson:"🎯 Nauk: Nikoli ne vpisujte pravih gesel v spletne obrazce, ki jim ne zaupate 100 %. Za preizkušanje uporabite izmišljeno geslo.",eduBtn:"Razumem",
  verdicts:["Zelo šibko","Šibko","Zmerno","Močno","Zelo močno"],
  score:"ocena",bits:"bitov",length:"Dolžina",
  cmpAstronger:"Geslo A je močnejše 💪",cmpBstronger:"Geslo B je močnejše 💪",cmpEqual:"Gesli sta enako močni",
  copied:"Kopirano ✓",enterFirst:"Najprej vnesite geslo",
  scen:[["🌐","Spletni napad (omejen)","~100/s"],["⚡","Spletni napad (hiter)","~10 tisoč/s"],["🖥️","Offline (počasen hash)","bcrypt/argon2"],["🎮","Offline GPU (hiter hash)","~100 milijard/s"],["🏭","Napadalec z mnogo GPU","~10 bilijonov/s"]],
  chk:["Vsaj 12 znakov","16+ znakov (priporočeno)","Male in velike črke","Vsebuje številke","Vsebuje posebne znake","Ni v seznamu pogostih gesel","Brez zaporedij / ponavljanj","Brez letnic"],
  rec:{common:"🚨 To je eno najpogostejših gesel na svetu. Napadalec ga preizkusi med prvimi – takoj ga zamenjajte.",dictword:"📖 Geslo vsebuje pogosto besedo iz slovarja (tudi z zamenjavo črk s številkami). Napadalci te vzorce poznajo.",short:"📏 Podaljšajte geslo na vsaj 12–16 znakov. Dolžina prispeva k varnosti bolj kot kompleksnost.",case:"🔠 Mešajte male in velike črke.",num:"🔢 Dodajte nekaj številk (a ne le na koncu).",spec:"✳️ Dodajte posebne znake (npr. ! ? # % &).",sequence:"➡️ Izogibajte se zaporedjem tipk in črk (abc, 123, qwertz).",repeat:"🔁 Izogibajte se ponavljajočim se znakom (aaa, 111).",year:"📅 Ne uporabljajte letnic ali rojstnih datumov.",g1:"✅ Odlično – to je močno geslo.",g2:"🗝️ Uporabite upravitelja gesel in za vsak račun drugačno geslo.",g3:"📱 Kjer je mogoče, vklopite dvostopenjsko avtentikacijo (2FA).",tip:"💡 Namig: geslo-fraza iz več naključnih besed je enostavna za pomnjenje in zelo močna. Uporabite generator."},
  badges:["12+ znakov","20+ znakov","Vse vrste znakov","Ni slovarsko","80+ bitov entropije","Trdnjava (ocena 4)"],
  pdfTitle:"Poročilo o varnosti gesla",pdfNo:"To poročilo ne vsebuje analiziranega gesla.",pdfDate:"Datum",pdfScenario:"Scenarij napada",pdfAssume:"Predpostavka",pdfTime:"Čas"
 },
 en:{
  title:"How secure is your password? 🔒",
  lead:'Enter a password to get a strength rating, concrete suggestions and a realistic crack time. Everything is computed <b>locally in your browser</b> – the password never leaves this device.',
  step1:"Input & analysis", step2:"Results",
  enterPw:"Enter a password to analyze", phStart:"Start typing…", enterPrompt:"Enter a password…",
  cLen:"Chars",cLow:"Lower",cUp:"Upper",cNum:"Digits",cSpec:"Special",cEnt:"Entropy",
  policyTitle:"🏛️ Organization password policy (optional)",
  policyDesc:"Check the password against your organization's rules.",
  polMinLen:"Minimum length",polUpper:"Uppercase",polLower:"Lowercase",polNum:"Digits",polSym:"Special chars",polNoCommon:"Not a common password",
  polPass:"Password MEETS the policy",polFail:"Password does NOT meet the policy",
  genTitle:"Strong password generator",genPw:"Random password",genPhrase:"Passphrase",
  optAmb:"Exclude ambiguous",phCap:"Capitalize",phNum:"Add a number",
  phGen:"Click Generate…",btnGen:"Generate",btnCopy:"Copy",btnUse:"Use for analysis",
  genPrivacy:"🔐 Uses a cryptographically secure random source (crypto.getRandomValues).",
  next:"Next: results →",back:"Back",
  resultTitle:"Checklist, recommendations and achievements",checklist:"Checklist",recs:"Recommendations",ach:"Achievements",
  crackTitle:"Crack time estimate",crackDesc:"How long an attacker would need to crack it at realistic hardware speeds.",
  vizTitle:"Effect of length on crack time",vizDesc:"Each extra character exponentially increases crack time (offline GPU attack). Your length is highlighted.",
  cmpTitle:"Compare two passwords",cmpAph:"Password A",cmpBph:"Password B",
  btnPdf:"Download report (PDF)",
  footPrivacy:"🔐 This page does not store or send your passwords. All processing happens locally in the browser.",
  footBy:"Developed by the Cybersecurity Department of <b>SRC d.o.o.</b> · For awareness and education.",
  eduTitle:"Educational warning · SRC d.o.o.",eduOops:"OOPS!",eduLine1a:"Your password",eduLine1b:"was just “logged and sent to an attacker”.",
  eduLine2:"But it said nothing is logged? Exactly – you fell for a social-engineering tactic. This was a test. Your password was NOT stored or sent anywhere.",
  eduLesson:"🎯 Lesson: Never enter your real passwords into web forms you don't 100% trust. Use a fake password for testing.",eduBtn:"Got it",
  verdicts:["Very weak","Weak","Fair","Strong","Very strong"],
  score:"score",bits:"bits",length:"Length",
  cmpAstronger:"Password A is stronger 💪",cmpBstronger:"Password B is stronger 💪",cmpEqual:"Both are equally strong",
  copied:"Copied ✓",enterFirst:"Enter a password first",
  scen:[["🌐","Online attack (throttled)","~100/s"],["⚡","Online attack (fast)","~10k/s"],["🖥️","Offline (slow hash)","bcrypt/argon2"],["🎮","Offline GPU (fast hash)","~100 billion/s"],["🏭","Attacker with many GPUs","~10 trillion/s"]],
  chk:["At least 12 chars","16+ chars (recommended)","Upper & lower case","Contains digits","Contains special chars","Not a common password","No sequences / repeats","No years"],
  rec:{common:"🚨 This is one of the most common passwords in the world. Attackers try it first – change it now.",dictword:"📖 Password contains a common dictionary word (even with letter/number substitutions). Attackers know these patterns.",short:"📏 Extend to at least 12–16 chars. Length matters more than complexity.",case:"🔠 Mix upper and lower case.",num:"🔢 Add some digits (not only at the end).",spec:"✳️ Add special characters (e.g. ! ? # % &).",sequence:"➡️ Avoid keyboard/letter sequences (abc, 123, qwerty).",repeat:"🔁 Avoid repeated characters (aaa, 111).",year:"📅 Don't use years or birth dates.",g1:"✅ Excellent – this is a strong password.",g2:"🗝️ Use a password manager and a unique password per account.",g3:"📱 Enable two-factor authentication (2FA) wherever possible.",tip:"💡 Tip: a passphrase of several random words is easy to remember and very strong. Use the generator."},
  badges:["12+ chars","20+ chars","All char types","Not dictionary","80+ bits entropy","Fortress (score 4)"],
  pdfTitle:"Password security report",pdfNo:"This report does not contain the analyzed password.",pdfDate:"Date",pdfScenario:"Attack scenario",pdfAssume:"Assumption",pdfTime:"Time"
 }
};
let LANG = "sl";
try{ const s=localStorage.getItem("src_pw_lang"); if(s==="en"||s==="sl") LANG=s; }catch{}
function t(){ return I18N[LANG]; }

/* ---------- Blocklists ---------- */
const COMMON = new Set(["geslo","password","passwort","qwerty","asdf","123456","12345678","123456789","1234567890",
"111111","000000","abc123","admin","welcome","letmein","iloveyou","dragon","monkey","master","login","guest","user",
"sunshine","princess","football","superman","batman","trustno1","1q2w3e","zaq12wsx","qwertz","slovenija","ljubljana",
"maribor","triglav","novak","olimpija","doncic","pogacar","roglic","test","pivo","sonce","luna","geslo123","slo123",
"celje","kranj","koper","piran","bled","morje","gora","kava","zmaga","domovina","secret","computer","internet"]);
const SEQ = ["abcdefghijklmnopqrstuvwxyz","qwertzuiopasdfghjklyxcvbnm","qwertyuiopasdfghjklzxcvbnm","0123456789"];
const LEET = {a:"@4",e:"3",i:"1!",o:"0",s:"$5",t:"7",l:"1",b:"8",g:"9"};

function poolSize(pw){ let s=0;
  if(/[a-z]/.test(pw)) s+=26; if(/[A-Z]/.test(pw)) s+=26; if(/[0-9]/.test(pw)) s+=10;
  if(/[^a-zA-Z0-9]/.test(pw)) s+=33; if(/[^\x00-\x7F]/.test(pw)) s+=40; return Math.max(s,1); }
function normalize(pw){ let s=pw.toLowerCase(); for(const k in LEET){ for(const ch of LEET[k]) s=s.split(ch).join(k); } return s; }
function hasSequence(pw){ const low=pw.toLowerCase();
  for(const seq of SEQ){ for(let i=0;i+3<=seq.length;i++){ const f=seq.slice(i,i+4);
    if(low.includes(f)) return true; if(low.includes(f.split("").reverse().join(""))) return true; } } return false; }
function hasRepeat(pw){ return /(.)\1{2,}/.test(pw); }
function looksLikeYear(pw){ return /(19|20)\d{2}/.test(pw); }
function isDictionary(pw){ const n=normalize(pw);
  if(COMMON.has(n)) return "exact"; for(const w of COMMON){ if(w.length>=4 && n.includes(w)) return "contains"; } return null; }

function analyze(pw){
  const len=pw.length;
  const counts={lower:(pw.match(/[a-z]/g)||[]).length,upper:(pw.match(/[A-Z]/g)||[]).length,num:(pw.match(/[0-9]/g)||[]).length,spec:(pw.match(/[^a-zA-Z0-9]/g)||[]).length};
  const pool=poolSize(pw); let baseEntropy=len>0?len*Math.log2(pool):0; const weaknesses=[]; let penalty=0;
  const dict=isDictionary(pw);
  if(dict==="exact"){ penalty+=baseEntropy*0.85; weaknesses.push("common"); }
  else if(dict==="contains"){ penalty+=Math.min(baseEntropy*0.35,14); weaknesses.push("dictword"); }
  if(hasSequence(pw)){ penalty+=Math.min(baseEntropy*0.25,10); weaknesses.push("sequence"); }
  if(hasRepeat(pw)){ penalty+=Math.min(baseEntropy*0.2,8); weaknesses.push("repeat"); }
  if(looksLikeYear(pw)){ penalty+=4; weaknesses.push("year"); }
  if(len>0 && len<8){ penalty+=6; weaknesses.push("short"); }
  const classes=[counts.lower>0,counts.upper>0,counts.num>0,counts.spec>0].filter(Boolean).length;
  if(classes<=1 && len>0) penalty+=Math.min(baseEntropy*0.15,6);
  let eff=Math.max(baseEntropy-penalty,0); if(len===0) eff=0;
  const guesses=len?Math.pow(2,eff)/2:0;
  let score; if(eff<28)score=0; else if(eff<36)score=1; else if(eff<60)score=2; else if(eff<128)score=3; else score=4;
  if(dict==="exact") score=0;
  return {len,counts,pool,baseEntropy,eff,guesses,score,weaknesses,classes};
}

/* ---------- crack time ---------- */
const RATES=[100,1e4,1e4,1e11,1e13];
function fmtTime(sec){
  const L=LANG;
  if(sec<1e-3) return L==="sl"?"trenutno":"instantly";
  if(sec<1) return L==="sl"?"manj kot sekunda":"less than a second";
  const U = L==="sl"
    ? [["stoletij",3155760000],["let",31557600],["mesecev",2629800],["dni",86400],["ur",3600],["minut",60],["sekund",1]]
    : [["centuries",3155760000],["years",31557600],["months",2629800],["days",86400],["hours",3600],["minutes",60],["seconds",1]];
  if(sec>3155760000*100){ const c=sec/3155760000; if(c>1e6) return L==="sl"?"praktično nerazbitno":"practically uncrackable";
    return Math.round(c).toLocaleString(L)+" "+(L==="sl"?"stoletij":"centuries"); }
  for(const [lab,s] of U){ if(sec>=s){ return Math.floor(sec/s).toLocaleString(L)+" "+lab; } }
  return L==="sl"?"trenutno":"instantly";
}
function timeColor(sec){ if(sec<3600) return "var(--bad)"; if(sec<86400*30) return "var(--warn)"; if(sec<31557600*100) return "var(--mid)"; return "var(--ok)"; }

/* ---------- checklist / recs / badges ---------- */
function checklist(a){ return [
  a.len>=12, a.len>=16, a.counts.upper>0&&a.counts.lower>0, a.counts.num>0, a.counts.spec>0,
  !a.weaknesses.includes("common")&&!a.weaknesses.includes("dictword"),
  !a.weaknesses.includes("sequence")&&!a.weaknesses.includes("repeat"),
  !a.weaknesses.includes("year") ]; }
function recommend(a){
  if(a.len===0) return []; const R=t().rec; const r=[];
  if(a.weaknesses.includes("common")) r.push({txt:R.common,danger:true});
  if(a.weaknesses.includes("dictword")) r.push({txt:R.dictword});
  if(a.len<12) r.push({txt:R.short});
  if(a.counts.upper===0||a.counts.lower===0) r.push({txt:R.case});
  if(a.counts.num===0) r.push({txt:R.num});
  if(a.counts.spec===0) r.push({txt:R.spec});
  if(a.weaknesses.includes("sequence")) r.push({txt:R.sequence});
  if(a.weaknesses.includes("repeat")) r.push({txt:R.repeat});
  if(a.weaknesses.includes("year")) r.push({txt:R.year});
  if(r.length===0){ r.push({txt:R.g1,good:true}); r.push({txt:R.g2,good:true}); r.push({txt:R.g3,good:true}); }
  else r.push({txt:R.tip,good:true});
  return r;
}
const BADGE_TEST=[a=>a.len>=12,a=>a.len>=20,a=>a.classes===4,a=>a.len>0&&!a.weaknesses.includes("common")&&!a.weaknesses.includes("dictword"),a=>a.eff>=80,a=>a.score===4];
const BADGE_EMOJI=["📏","📐","🎨","🛡️","🔥","🏰"];

let LAST=null;

/* ---------- render step 1 (live) ---------- */
function renderLive(pw){
  const a=analyze(pw); LAST=a; const T=t();
  $("sLen").textContent=a.len; $("sLow").textContent=a.counts.lower; $("sUp").textContent=a.counts.upper;
  $("sNum").textContent=a.counts.num; $("sSpec").textContent=a.counts.spec; $("sEnt").textContent=Math.round(a.eff);
  const v=T.verdicts[a.score]; const cols=["var(--bad)","var(--bad)","var(--warn)","var(--mid)","var(--ok)"];
  const fill=$("fill"); fill.style.width=(a.len?(a.score+1)*20:0)+"%"; fill.style.background=cols[a.score];
  if(a.len===0){ $("verdict").textContent=T.enterPrompt; $("verdict").style.color="var(--muted)"; $("verdictSub").textContent=""; }
  else{ $("verdict").textContent=v; $("verdict").style.color=cols[a.score]; $("verdictSub").textContent=T.score+" "+a.score+"/4 · ~"+Math.round(a.eff)+" "+T.bits; }
  renderPolicy(a,pw);
}

/* ---------- policy checker ---------- */
function renderPolicy(a,pw){
  const box=$("polResult"); if(!box) return; const T=t();
  if(pw.length===0){ box.innerHTML=""; return; }
  const min=Math.max(1,+$("polMin").value||1);
  const fails=[];
  if(a.len<min) fails.push((LANG==="sl"?"Prekratko (< ":"Too short (< ")+min+")");
  if($("polUpper").checked && a.counts.upper===0) fails.push(T.polUpper);
  if($("polLower").checked && a.counts.lower===0) fails.push(T.polLower);
  if($("polNum").checked && a.counts.num===0) fails.push(T.polNum);
  if($("polSym").checked && a.counts.spec===0) fails.push(T.polSym);
  if($("polNoCommon").checked && (a.weaknesses.includes("common")||a.weaknesses.includes("dictword"))) fails.push(T.polNoCommon);
  if(fails.length===0){ box.innerHTML=`<span class="polbadge pass">✓ ${T.polPass}</span>`; }
  else{ box.innerHTML=`<span class="polbadge fail">✕ ${T.polFail}</span><div class="polfail">• ${fails.join("<br>• ")}</div>`; }
}

/* ---------- render step 2 ---------- */
function renderResults(){
  const a=LAST||analyze($("pw").value); const T=t();
  const v=T.verdicts[a.score]; const cols=["var(--bad)","var(--bad)","var(--warn)","var(--mid)","var(--ok)"];
  $("verdictBig").textContent = a.len? v+" · "+Math.round(a.eff)+" "+T.bits : T.enterPrompt;
  $("verdictBig").style.color = a.len? cols[a.score] : "var(--muted)";

  const cl=checklist(a), cbox=$("checks"); cbox.innerHTML="";
  cl.forEach((ok,i)=>{ const d=document.createElement("div"); d.className="chk "+(ok?"pass":(a.len?"fail":""));
    d.innerHTML=`<span class="mark">${ok?"✓":(a.len?"✕":"")}</span><span>${T.chk[i]}</span>`; cbox.appendChild(d); });

  const rec=recommend(a), rbox=$("recs"); rbox.innerHTML="";
  if(rec.length===0) rbox.innerHTML=`<li class="subtle" style="border:0;background:none">${T.enterPrompt}</li>`;
  rec.forEach(r=>{ const li=document.createElement("li"); if(r.good)li.className="good"; if(r.danger)li.className="danger"; li.textContent=r.txt; rbox.appendChild(li); });

  const abox=$("ach"); abox.innerHTML="";
  BADGE_TEST.forEach((fn,i)=>{ const on=a.len>0&&fn(a); const d=document.createElement("div"); d.className="badge "+(on?"on":"");
    d.innerHTML=`<span class="e">${BADGE_EMOJI[i]}</span><span>${T.badges[i]}</span>`; abox.appendChild(d); });

  const scen=$("scen"); scen.innerHTML="";
  if(a.len===0){ scen.innerHTML=`<div class="subtle">${T.enterPrompt}</div>`; }
  else T.scen.forEach((s,i)=>{ const sec=a.guesses/RATES[i]; const row=document.createElement("div"); row.className="scenrow";
    row.innerHTML=`<div class="l"><span class="ico">${s[0]}</span><span class="name"><b>${s[1]}</b><span>${s[2]}</span></span></div><span class="time" style="color:${timeColor(sec)}">${fmtTime(sec)}</span>`;
    scen.appendChild(row); });

  renderViz(a);
}

/* ---------- length -> time visualization ---------- */
function renderViz(a){
  const viz=$("viz"); viz.innerHTML=""; if(a.len===0){ viz.innerHTML=`<div class="subtle">${t().enterPrompt}</div>`; return; }
  const pool=a.pool||26; const gpu=1e11;
  const lengths=[6,8,10,12,14,16,20,24];
  if(!lengths.includes(a.len)) lengths.push(a.len);
  lengths.sort((x,y)=>x-y);
  const secs=lengths.map(L=>Math.pow(2, L*Math.log2(pool))/2/gpu);
  const maxLog=Math.max(...secs.map(s=>Math.log10(Math.max(s,1e-6))));
  const minLog=Math.min(...secs.map(s=>Math.log10(Math.max(s,1e-6))));
  const span=Math.max(maxLog-minLog,1);
  lengths.forEach((L,i)=>{
    const s=secs[i]; const lg=Math.log10(Math.max(s,1e-6));
    const w=Math.max(4, ((lg-minLog)/span)*100);
    const row=document.createElement("div"); row.className="vizrow"+(L===a.len?" you":"");
    row.innerHTML=`<span class="lab">${L} ${LANG==="sl"?"zn.":"ch."}</span><span class="track"><span class="bar" style="width:${w}%"></span></span><span class="val">${fmtTime(s)}</span>`;
    viz.appendChild(row);
  });
}

/* ---------- compare two passwords ---------- */
function renderCompare(){
  const T=t(); const a=analyze($("cmpA").value), b=analyze($("cmpB").value);
  const cols=["var(--bad)","var(--bad)","var(--warn)","var(--mid)","var(--ok)"];
  function fill(box,x){ if(x.len===0){ $(box).innerHTML=""; return; }
    const sec=x.guesses/1e11;
    $(box).innerHTML=`${T.verdicts[x.score]} · ${Math.round(x.eff)} ${T.bits}<div class="mini"><i style="width:${(x.score+1)*20}%;background:${cols[x.score]}"></i></div>GPU: ${fmtTime(sec)}`;
  }
  fill("cmpOutA",a); fill("cmpOutB",b);
  const cv=$("cmpVerdict");
  if(a.len===0||b.len===0){ cv.textContent=""; return; }
  if(a.eff>b.eff+2) cv.innerHTML="🅰️ "+T.cmpAstronger;
  else if(b.eff>a.eff+2) cv.innerHTML="🅱️ "+T.cmpBstronger;
  else cv.textContent=T.cmpEqual;
}

/* ---------- generator ---------- */
function secureInt(max){ const arr=new Uint32Array(1); const limit=Math.floor(4294967296/max)*max; let x; do{ crypto.getRandomValues(arr); x=arr[0]; }while(x>=limit); return x%max; }
function pick(s){ return s[secureInt(s.length)]; }
function genPassword(){
  const len=+$("lenRange").value; let sets=[]; const amb=$("optAmb").checked;
  let U="ABCDEFGHIJKLMNOPQRSTUVWXYZ",L="abcdefghijklmnopqrstuvwxyz",N="0123456789",S="!@#$%^&*-_=+?";
  if(amb){U=U.replace(/[IO]/g,"");L=L.replace(/[lo]/g,"");N=N.replace(/[01]/g,"");}
  if($("optUpper").checked)sets.push(U); if($("optLower").checked)sets.push(L); if($("optNum").checked)sets.push(N); if($("optSym").checked)sets.push(S);
  if(sets.length===0)sets.push(L); const all=sets.join(""); let out=[];
  for(const s of sets)out.push(pick(s)); while(out.length<len)out.push(pick(all));
  for(let i=out.length-1;i>0;i--){const j=secureInt(i+1);[out[i],out[j]]=[out[j],out[i]];}
  return out.slice(0,len).join("");
}
const WORDS=["jabolko","gora","reka","modra","postelja","konj","baterija","oblak","zvezda","kamen","veter","ogenj","snops","lisica","hrast","zvon","most","luna","sonce","srce","kolo","knjiga","kava","deznik","gozd","morje","pesek","tiger","riba","ptica","cvet","list","koren","zima","poletje","sever","jug","mesec","polje","hisa","vrata","okno","ura","zemlja","nebo","dolina","otok","jezero","slap","mavrica","kompas","sidro","perje","megla","iskra","valj"];
function genPassphrase(){ const n=+$("wordsRange").value,cap=$("phCap").checked,num=$("phNum").checked; let w=[];
  for(let i=0;i<n;i++){ let x=WORDS[secureInt(WORDS.length)]; if(cap)x=x.charAt(0).toUpperCase()+x.slice(1); w.push(x); }
  let o=w.join("-"); if(num)o+="-"+secureInt(100); return o; }
let genMode="password";
function generate(){ const v=genMode==="password"?genPassword():genPassphrase(); $("genField").value=v; return v; }

/* ---------- PDF ---------- */
function exportPDF(){
  const a=LAST||analyze(""); const T=t();
  if(a.len===0){ toast(T.enterFirst); return; }
  const v=T.verdicts[a.score]; const colHex=["#f85149","#f85149","#d29922","#db8b2c","#3fb950"][a.score];
  const rows=T.scen.map((s,i)=>{ const sec=a.guesses/RATES[i]; return `<tr><td>${s[1]}</td><td>${s[2]}</td><td style="font-weight:700">${fmtTime(sec)}</td></tr>`; }).join("");
  const recs=recommend(a).map(r=>`<li>${r.txt}</li>`).join("");
  const now=new Date().toLocaleString(LANG);
  const html=`<!doctype html><html lang="${LANG}"><head><meta charset="utf-8"><title>${T.pdfTitle} – SRC</title>
  <style>body{font-family:Arial,sans-serif;color:#111;margin:40px;line-height:1.5}h1{color:#0086bd;font-size:22px}
  h2{font-size:15px;margin-top:24px;border-bottom:2px solid #0086bd;padding-bottom:4px}
  .badge{display:inline-block;padding:6px 14px;border-radius:20px;color:#fff;font-weight:700}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}td,th{border:1px solid #ddd;padding:8px;text-align:left}
  th{background:#f1f6fb}.muted{color:#666;font-size:12px}ul{font-size:13px}.stat{display:inline-block;margin-right:16px;font-size:13px}
  .foot{margin-top:30px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:10px}</style></head>
  <body onload="window.print()"><h1>🔒 ${T.pdfTitle}</h1>
  <p class="muted">SRC d.o.o. · ${T.pdfDate}: ${now}</p><p>${T.pdfNo}</p>
  <h2>${T.resultTitle}</h2><p><span class="badge" style="background:${colHex}">${v} (${a.score}/4)</span></p>
  <p class="stat">${T.length}: <b>${a.len}</b></p><p class="stat">${T.cEnt}: <b>${Math.round(a.eff)} ${T.bits}</b></p>
  <p class="stat">${T.cLow}/${T.cUp}/${T.cNum}/${T.cSpec}: <b>${a.counts.lower}/${a.counts.upper}/${a.counts.num}/${a.counts.spec}</b></p>
  <h2>${T.crackTitle}</h2><table><tr><th>${T.pdfScenario}</th><th>${T.pdfAssume}</th><th>${T.pdfTime}</th></tr>${rows}</table>
  <h2>${T.recs}</h2><ul>${recs}</ul>
  <div class="foot">SRC d.o.o.</div></body></html>`;
  const w=window.open("","_blank"); if(!w){ toast(LANG==="sl"?"Dovolite pojavna okna za PDF":"Allow pop-ups for PDF"); return; }
  w.document.write(html); w.document.close();
}

/* ---------- wizard nav ---------- */
function goStep(n){
  $("step1").classList.toggle("hidden",n!==1);
  $("step2").classList.toggle("hidden",n!==2);
  document.querySelectorAll("#stepsBar .step").forEach(s=>{ const k=+s.dataset.step;
    s.classList.toggle("active",k===n); s.classList.toggle("done",k<n); });
  if(n===2) renderResults();
  window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------- i18n apply ---------- */
function applyLang(){
  document.documentElement.lang=LANG; const T=t();
  document.querySelectorAll("[data-i18n]").forEach(el=>{ const k=el.getAttribute("data-i18n"); if(T[k]!=null) el.innerHTML=T[k]; });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{ const k=el.getAttribute("data-i18n-ph"); if(T[k]!=null) el.placeholder=T[k]; });
  $("lenLabel").textContent=(LANG==="sl"?"Dolžina":"Length")+": "+$("lenRange").value;
  $("wordsLabel").textContent=(LANG==="sl"?"Besede":"Words")+": "+$("wordsRange").value;
  renderLive($("pw").value);
  if(!$("step2").classList.contains("hidden")) renderResults();
  renderCompare();
}

/* ---------- events ---------- */
$("pw").addEventListener("input",e=>renderLive(e.target.value));
["polMin","polUpper","polLower","polNum","polSym","polNoCommon"].forEach(id=>{ const el=$(id); if(el) el.addEventListener("input",()=>renderLive($("pw").value)); });
$("toggleVis").addEventListener("click",()=>{ const f=$("pw"); f.type=f.type==="password"?"text":"password"; });
$("clearBtn").addEventListener("click",()=>{ $("pw").value=""; renderLive(""); $("pw").focus(); });
$("lenRange").addEventListener("input",e=>$("lenLabel").textContent=(LANG==="sl"?"Dolžina":"Length")+": "+e.target.value);
$("wordsRange").addEventListener("input",e=>$("wordsLabel").textContent=(LANG==="sl"?"Besede":"Words")+": "+e.target.value);
document.querySelectorAll("#modeSeg button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("#modeSeg button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); genMode=b.dataset.mode;
  $("pwOpts").classList.toggle("hidden",genMode!=="password"); $("phOpts").classList.toggle("hidden",genMode!=="passphrase"); }));
$("genBtn").addEventListener("click",generate);
$("copyBtn").addEventListener("click",async()=>{ const v=$("genField").value||generate();
  try{ await navigator.clipboard.writeText(v); toast(t().copied); }catch{ $("genField").select(); document.execCommand("copy"); toast(t().copied); } });
$("useGen").addEventListener("click",()=>{ const v=$("genField").value||generate(); $("pw").value=v; $("pw").type="text"; renderLive(v); });
$("toStep2").addEventListener("click",()=>goStep(2));
$("toStep1").addEventListener("click",()=>goStep(1));
$("pdfBtn").addEventListener("click",exportPDF);
$("cmpA").addEventListener("input",renderCompare); $("cmpB").addEventListener("input",renderCompare);
function toast(m){ const el=$("toast"); el.textContent=m; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),1600); }

$("themeBtn").addEventListener("click",()=>{ const cur=document.documentElement.getAttribute("data-theme");
  const next=cur==="light"?"dark":(cur==="dark"?"light":"light"); document.documentElement.setAttribute("data-theme",next);
  try{ localStorage.setItem("src_pw_theme",next); }catch{} });
try{ const s=localStorage.getItem("src_pw_theme"); if(s) document.documentElement.setAttribute("data-theme",s); }catch{}
$("langBtn").addEventListener("click",()=>{ LANG=LANG==="sl"?"en":"sl"; try{ localStorage.setItem("src_pw_lang",LANG); }catch{} applyLang(); });

/* ---------- init ---------- */
applyLang(); generate();

/* ============================================================
   Izobraževalni popup – sproži se 20 s po prvem vpisu v polje geslo.
   Prikaže se enkrat. Geslo se NIKAMOR ne shrani in ne pošlje.
   ============================================================ */
(function(){
  const DELAY_MS=20000; let timer=null, shown=false;
  const pwEl=$("pw"), overlay=$("eduOverlay"); if(!pwEl||!overlay) return;
  function showEdu(){ if(shown)return; shown=true; $("eduPw").textContent=pwEl.value||"(…)"; overlay.hidden=false; const b=$("eduClose"); if(b)b.focus(); }
  function closeEdu(){ overlay.hidden=true; }
  pwEl.addEventListener("input",function(){ if(timer||shown)return; timer=setTimeout(showEdu,DELAY_MS); });
  $("eduClose").addEventListener("click",closeEdu);
  overlay.addEventListener("click",e=>{ if(e.target===overlay) closeEdu(); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!overlay.hidden) closeEdu(); });
})();
