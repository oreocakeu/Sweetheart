/* 藍の光 — scroll light journey, denim bouquet, YouTube toggle */
const $ = s => document.querySelector(s);
const lerp=(a,b,t)=>a+(b-a)*t;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>a.map((v,i)=>Math.round(lerp(v,b[i],t)));
const rgb=c=>`rgb(${c.join()})`;
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};

/* ===== Colour journey (original palette). Edit these stops to change the sky.
   p = scroll progress (0 top -> 1 bottom), bg = sky/box colour, orb = glow colour (r,g,b) */
const stops=[
  {p:0,   bg:"#e8eef8", orb:"255,236,170"},
  {p:.22, bg:"#9bbbe3", orb:"255,214,120"},
  {p:.45, bg:"#41659f", orb:"255,160,110"},
  {p:.7,  bg:"#1a2c58", orb:"190,200,255"},
  {p:1,   bg:"#070d22", orb:"220,230,255"}
].map(s=>({...s,rgb:hex(s.bg),orbRgb:s.orb.split(",").map(Number)}));

/* Text colours: at every scroll position we pick whichever option has the higher
   contrast against the current box colour, so the poem never gets lost. */
const INK ={dark:"#0b1733",light:"#fff8ea"};   // poem text
const GOLD={dark:"#5a3d05",light:"#f2d68f"};   // stanza headings
const HALO={dark:"rgba(255,255,255,.45)",light:"rgba(7,13,34,.55)"};
const L_={ink:{dark:lum(hex(INK.dark)),light:lum(hex(INK.light))},gold:{dark:lum(hex(GOLD.dark)),light:lum(hex(GOLD.light))}};
const ratio=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
const best=(L,o)=>ratio(L,o.dark)>=ratio(L,o.light)?"dark":"light";

let prog=0;
const orb=$("#orb"), bar=$("#bar");
function theme(p){
  let i=0; while(i<stops.length-2 && p>stops[i+1].p) i++;
  const a=stops[i], b=stops[i+1], t=Math.min(1,Math.max(0,(p-a.p)/(b.p-a.p)));
  const bg=mix(a.rgb,b.rgb,t), L=lum(bg), root=document.documentElement.style;
  root.setProperty("--bg",rgb(bg));
  const ink=best(L,L_.ink);
  root.setProperty("--ink",INK[ink]);
  root.setProperty("--halo",HALO[ink]);
  const g=best(L,L_.gold);   // gold headings, but fall back to the poem colour where gold would be faint
  root.setProperty("--accent",ratio(L,L_.gold[g])>=4?GOLD[g]:INK[ink]);
  const o=mix(a.orbRgb,b.orbRgb,t);
  orb.style.background=`radial-gradient(circle,rgba(${o},.95) 0%,rgba(${o},.45) 32%,rgba(${o},0) 68%)`;
  orb.style.top=(18+p*22)+"%";
  orb.style.left=(50+Math.sin(p*Math.PI*2)*30)+"%";
  orb.style.opacity=1-p*.35;
}
function onScroll(){
  const h=document.documentElement.scrollHeight-innerHeight;
  prog=h>0?Math.min(1,Math.max(0,scrollY/h)):0;
  theme(prog);
  bar.style.width=(prog*100)+"%";
}
addEventListener("scroll",onScroll,{passive:true});

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")}),{threshold:.25});
document.querySelectorAll(".stitch,.reveal").forEach(el=>io.observe(el));

/* particles: warm motes by day → stars + fireflies by night */
const cv=$("#fx"),cx=cv.getContext("2d");
let W=0,H=0,motes=[];
function size(){
  const dpr=Math.min(devicePixelRatio||1,2);
  W=innerWidth;H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.round(Math.min(140,Math.max(45,W*H/12000)));      // fewer on phones
  motes=Array.from({length:n},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.5+.5,s:Math.random()*.4+.05,ph:Math.random()*6.28}));
}
size();
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{size();onScroll()},120)});
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const sc=()=>Math.min(1.4,Math.max(.8,W/900));
function frame(t){
  cx.clearRect(0,0,W,H);
  const night=Math.max(0,(prog-.45)/.55), day=Math.max(0,1-prog*1.8), k=sc();
  for(const s of motes){
    const x=s.x*W, y=((s.y*H - t*.012*s.s*(1-night*.8))%H+H)%H;
    const tw=.5+.5*Math.sin(t*.002*s.s*4+s.ph);
    if(night>0){cx.fillStyle=`rgba(243,234,215,${night*tw*.9})`;cx.beginPath();cx.arc(x,s.y*H*.9,s.r*.8*k,0,6.28);cx.fill()}
    const a=day>.02?day*.55*tw:(night>.5?(night-.5)*tw:0);
    if(a>.01){
      const fx=x+Math.sin(t*.0006+s.ph)*24, rr=s.r*7*k, c=day>.02?"255,225,150":"230,200,110";
      const g=cx.createRadialGradient(fx,y,0,fx,y,rr);
      g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(1,`rgba(${c},0)`);
      cx.fillStyle=g;cx.beginPath();cx.arc(fx,y,rr,0,6.28);cx.fill();
    }
  }
  if(!reduce)requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
onScroll();

/* ===== Bouquet ===== */
const NS="http://www.w3.org/2000/svg";
function el(n,a,p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e}
function buildBouquet(){
  const svg=$("#bq");svg.innerHTML="";
  const base={x:200,y:330};
  const defs=el("defs",{},svg);
  const gr=el("linearGradient",{id:"dn",x1:0,y1:0,x2:0,y2:1},defs);
  el("stop",{offset:"0","stop-color":"#3e63a3"},gr);el("stop",{offset:"1","stop-color":"#1d3566"},gr);
  const pat=el("pattern",{id:"tw",width:6,height:6,patternUnits:"userSpaceOnUse",patternTransform:"rotate(30)"},defs);
  el("line",{x1:0,y1:0,x2:0,y2:6,stroke:"#8fb0e0","stroke-width":.7,opacity:.45},pat);
  const rnd=(s=>()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296})(11);
  const greens=["#5f8f73","#6d9c7f","#4f7f66"];
  const hw=y=>62+((y-44)/32)*16.5;               // half-width of the bouquet at height y
  const pol=(a,r)=>[Math.cos(a*Math.PI/180)*r,Math.sin(a*Math.PI/180)*r];
  const L=(g,x1,y1,x2,y2,c,w)=>el("line",{x1,y1,x2,y2,stroke:c,"stroke-width":w,"stroke-linecap":"round"},g);
  const C=(g,x,y,r,f,s)=>el("circle",Object.assign({cx:x,cy:y,r,fill:f},s?{stroke:s,"stroke-width":.7}:{}),g);
  const E=(g,x,y,rx,ry,rot,f,s)=>el("ellipse",Object.assign({cx:x,cy:y,rx,ry,transform:`rotate(${rot} ${x} ${y})`,fill:f},s?{stroke:s,"stroke-width":.7}:{}),g);

  /* ---- the flowers: each one is drawn by hand-built shapes ---- */
  const D={
    hyd(g,x,y,r,c){for(let k=0;k<22;k++){const a=k*2.4,rr=r*Math.sqrt(k/22);C(g,x+Math.cos(a)*rr,y+Math.sin(a)*rr,r*.22+1,c,"#0f1c3d")}
      for(let k=0;k<5;k++)C(g,x+Math.cos(k*1.3)*r*.5,y+Math.sin(k*1.3)*r*.5,1.6,"#e8d9a8")},
    sak(g,x,y,r,c){for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-90,r*.55);E(g,x+dx,y+dy,r*.5,r*.42,k*72,c,"#e59fb4")}
      for(let k=0;k<8;k++){const [dx,dy]=pol(k*45,r*.28);L(g,x,y,x+dx,y+dy,"#c9475f",1);C(g,x+dx,y+dy,1.3,"#f7d46b")}C(g,x,y,r*.1,"#d9577a")},
    chr(g,x,y,r,c){const inner=c==="#d8b266"?"#f1d58f":"#ffffff";
      for(let k=0;k<24;k++){const [a,b]=pol(k*15,r*.28),[d,e]=pol(k*15,r*.98);L(g,x+a,y+b,x+d,y+e,c,r*.15)}
      for(let k=0;k<16;k++){const [a,b]=pol(k*22.5+8,r*.1),[d,e]=pol(k*22.5+8,r*.62);L(g,x+a,y+b,x+d,y+e,inner,r*.13)}
      C(g,x,y,r*.13,"#c98d2b")},
    cam(g,x,y,r){const cl=["#8f1d2c","#b3322d","#d9503f"];
      for(let l=0;l<3;l++)for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-90+l*36,r*(.55-.17*l));E(g,x+dx,y+dy,r*(.5-.1*l),r*(.46-.1*l),0,cl[l],"#6b1420")}
      for(let k=0;k<9;k++){const [dx,dy]=pol(k*40,r*.17);C(g,x+dx,y+dy,1.5,"#f7d46b")}C(g,x,y,r*.07,"#f7d46b")},
    kik(g,x,y,r){const pts=R=>Array.from({length:10},(_,i)=>{const [a,b]=pol(i*36-90,i%2?R*.42:R);return `${x+a},${y+b}`}).join(" ");
      el("polygon",{points:pts(r*1.05),fill:"#6f78e0",stroke:"#9aa2f2","stroke-width":3,"stroke-linejoin":"round"},g);
      el("polygon",{points:pts(r*.62),fill:"#8a92ee",stroke:"#8a92ee","stroke-width":2,"stroke-linejoin":"round"},g);
      for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-90,r*.5);L(g,x,y,x+dx,y+dy,"#4a52b8",1.2)}
      for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-54,r*.2);C(g,x+dx,y+dy,1.5,"#f6e6a0")}C(g,x,y,r*.1,"#ffffff")},
    pas(g,x,y,r){for(let k=0;k<10;k++){const [dx,dy]=pol(k*36,r*.62);E(g,x+dx,y+dy,r*.38,r*.12,k*36,k%2?"#e6dcf7":"#f8f4fd","#bfaee0")}
      for(let k=0;k<26;k++){const [a,b]=pol(k*13.85,r*.2),[d,e]=pol(k*13.85,r*.45);L(g,x+a,y+b,x+d,y+e,k%2?"#5b3a9f":"#c78ae0",1.1)}
      C(g,x,y,r*.2,"#d9c9f2","#8a6cc4");
      for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-90,r*.24);C(g,x+dx,y+dy,2.2,"#f2c94c")}
      for(let k=0;k<3;k++){const [dx,dy]=pol(k*120+30,r*.1);C(g,x+dx,y+dy,1.6,"#4f8f4a")}},
    cos(g,x,y,r,c){for(let k=0;k<8;k++){const [dx,dy]=pol(k*45,r*.55);E(g,x+dx,y+dy,r*.42,r*.34,k*45,c,"#c9587f")}
      C(g,x,y,r*.2,"#f2c230","#c98d2b")},
    wis(g,x,y,r){const cl=["#a894e8","#b9a9ee","#9a82e0","#c9bcf4"];
      for(let k=0;k<16;k++){const t=k/15,yy=y-r*.3+t*r*2,w=r*.55*(1-t*.8)+2,rr=r*.2*(1-t*.45)+1.6;
        C(g,x-w/2,yy,rr,cl[k%4],"#4a3a8a");C(g,x+w/2,yy+2,rr,cl[(k+1)%4],"#4a3a8a")}},
    gen(g,x,y,r){for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-90,r*.5);E(g,x+dx,y+dy,r*.42,r*.34,k*72-90,"#3a56c4","#9bb0f0")}
      for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-54,r*.3);L(g,x,y,x+dx,y+dy,"#1c2d78",1.4)}C(g,x,y,r*.2,"#1c2d78");C(g,x,y,r*.07,"#f6e6a0")},
    lil(g,x,y,r){for(let k=0;k<6;k++){const o=el("g",{transform:`translate(${x} ${y}) rotate(${k*60})`},g);
        el("path",{d:`M0 0 Q${r*.38} ${-r*.5} 0 ${-r*1.02} Q${-r*.38} ${-r*.5} 0 0Z`,fill:"#fffaf0",stroke:"#d8c9ae","stroke-width":.8},o);
        L(o,0,-r*.1,0,-r*.8,"#ecd9a8",.9)}
      for(let k=0;k<6;k++){const [dx,dy]=pol(k*60+30,r*.5);L(g,x,y,x+dx,y+dy,"#d9a441",1);C(g,x+dx,y+dy,2.1,"#b5651d")}}
  };

  /* ---- layout: 7 staggered rows that widen toward the rim ---- */
  const seq=["hyd","cam","kik","chr","sak","pas","cos","wis","lil","gen","chr","cam","sak","cos","hyd","kik","lil","pas","gen","wis"];
  const pal={hyd:["#3f6cc0","#6c93d6","#27457f"],chr:["#f6f0e0","#d8b266"],sak:["#f4c6d2","#f9dde5"],cos:["#f2a1c0","#fbf7ec","#e47fa7"]};
  const items=[];let n=0;
  for(let row=0;row<7;row++){
    const y=44+row*32,w=hw(y),cols=Math.max(3,Math.round(w*2/46));
    for(let i=0;i<cols;i++){
      const edge=(i===0||i===cols-1),t=seq[n++%seq.length],p=pal[t];
      items.push({t,row,c:p?p[(n+row)%p.length]:null,
        x:200-w+(i+.5)*(2*w/cols)+(rnd()*8-4),y:y+(rnd()*6-3),
        r:(27-row*.8+rnd()*3)*(edge?.84:1)*(row===6?.88:1)});
    }
  }

  /* big leaf fan (back layer) */
  const leaves=el("g",{},svg);
  [-74,-58,-42,-26,-10,6,22,38,54,70].forEach((a,i)=>{
    const Ln=140+((i*37)%32);
    const o=el("g",{transform:`translate(${base.x} ${base.y}) rotate(${a})`},leaves);
    const g=el("g",{class:"fl"},o);g.style.transformOrigin="50% 100%";g.style.animationDelay=(.1+i*.07)+"s";
    el("path",{d:`M0 0 Q18 ${-Ln*.5} 0 ${-Ln} Q-18 ${-Ln*.5} 0 0Z`,fill:greens[i%3]},g);
    el("path",{d:`M0 -6 L0 ${-Ln+12}`,stroke:"#9fc4a9","stroke-width":1,opacity:.7},g);
  });
  /* small leaves tucked into the gaps between flowers */
  const tuck=el("g",{},svg);
  for(let i=0;i<54;i++){
    const y=36+rnd()*212,x=200+(rnd()*2-1)*(hw(y)+6),a=rnd()*360;
    const o=el("g",{transform:`translate(${x} ${y}) rotate(${a})`},tuck);
    const g=el("g",{class:"fl",style:`animation-delay:${.2+rnd()*1.6}s`},o);
    el("path",{d:"M0 0 Q8 -15 0 -32 Q-8 -15 0 0Z",fill:greens[i%3]},g);
    el("path",{d:"M0 -3 L0 -26",stroke:"#9fc4a9","stroke-width":.7,opacity:.7},g);
  }
  /* baby's-breath sprigs around the edge */
  const sprigs=el("g",{},svg);
  [[24,170],[376,174],[88,52],[312,54],[34,108],[366,112],[150,14],[250,16],[16,226],[384,224]].forEach(([x,y],i)=>{
    const d=`M${base.x} ${base.y} Q${(base.x+x)/2+(x<200?-14:14)} ${(base.y+y)/2} ${x} ${y}`;
    el("path",{d,stroke:"#8fb89a","stroke-width":1.8,fill:"none","stroke-linecap":"round",class:"st",style:`animation-delay:${.3+i*.08}s`},sprigs);
    const g=el("g",{class:"fl",style:`animation-delay:${1.2+i*.08}s`},sprigs);
    for(let k=0;k<6;k++){const an=k*1.05+i,rr=k?7:0;C(g,x+Math.cos(an)*rr,y+Math.sin(an)*rr,k?3.2:4,"#fbf7ec")}
  });

  /* stems + flower heads */
  const stems=el("g",{},svg),heads=el("g",{},svg);
  items.forEach((f,i)=>{
    const d=`M${base.x} ${base.y} Q${(base.x+f.x)/2+(f.x<200?-20:20)} ${(base.y+f.y)/2} ${f.x} ${f.y}`;
    el("path",{d,stroke:"#7ea58a","stroke-width":2.2,fill:"none","stroke-linecap":"round",class:"st",style:`animation-delay:${i*.04}s`},stems);
    const g=el("g",{class:"fl",style:`animation-delay:${.5+i*.06}s`},heads);
    D[f.t](g,f.x,f.y,f.r,f.c);
  });
  /* tiny forget-me-nots tucked between neighbours */
  const fm=el("g",{},svg),pts=[];
  items.forEach((f,i)=>{
    const nx=items[i+1];if(nx&&nx.row===f.row)pts.push([(f.x+nx.x)/2,(f.y+nx.y)/2+4]);
    const below=items.filter(o=>o.row===f.row+1).sort((a,b)=>Math.abs(a.x-f.x)-Math.abs(b.x-f.x))[0];
    if(below)pts.push([(f.x+below.x)/2+8,(f.y+below.y)/2]);
  });
  pts.forEach(([x,y],i)=>{
    const g=el("g",{class:"fl",style:`animation-delay:${1.6+i*.03}s`},fm);
    for(let k=0;k<5;k++){const [dx,dy]=pol(k*72-90,4.2);C(g,x+dx,y+dy,3.4,"#8fb6ff","#0f1c3d")}
    C(g,x,y,2,"#ffe08a");
  });
  const w=el("g",{},svg), shape="M92 252 L308 252 L232 392 Q200 408 168 392 Z";
  el("path",{d:shape,fill:"url(#dn)",stroke:"#0f1c3d","stroke-width":2},w);
  el("path",{d:shape,fill:"url(#tw)"},w);
  el("path",{d:"M104 262 L296 262 L226 384 Q200 398 174 384 Z",fill:"none",stroke:"#c9a45c","stroke-width":1.6,"stroke-dasharray":"6 5"},w);
  el("path",{d:"M92 252 L308 252",stroke:"#b3322d","stroke-width":5},w);
  el("path",{d:"M92 258 L308 258",stroke:"#f3ead7","stroke-width":1.5},w);
  el("path",{d:"M170 296 Q200 316 230 296 L226 310 Q200 330 174 310 Z",fill:"#d8b266"},w);
  const tag=el("g",{},w);
  el("rect",{x:178,y:330,width:44,height:28,rx:2,fill:"#f3ead7",stroke:"#b3322d","stroke-width":1.4,"stroke-dasharray":"4 3"},tag);
  el("text",{x:200,y:349,"text-anchor":"middle","font-size":15,fill:"#1d3566","font-family":"Shippori Mincho,serif"},tag).textContent="藍";
}

const modal=$("#modal");let shown=false,lastFocus=null;
function openB(){lastFocus=document.activeElement;buildBouquet();modal.classList.add("open");shown=true;$("#close").focus();document.body.style.overflow="hidden"}
function closeB(){modal.classList.remove("open");document.body.style.overflow="";lastFocus&&lastFocus.focus&&lastFocus.focus()}
$("#open").onclick=openB;$("#close").onclick=closeB;
modal.addEventListener("click",e=>{if(e.target===modal)closeB()});
addEventListener("keydown",e=>{if(e.key==="Escape")closeB()});
$("#again").onclick=()=>{closeB();scrollTo({top:0,behavior:"smooth"})};
/* pop up automatically after the final stanza has been in view for a moment */
let timer;
new IntersectionObserver(es=>es.forEach(e=>{
  clearTimeout(timer);
  if(e.isIntersecting&&!shown)timer=setTimeout(openB,2600);
}),{threshold:.7}).observe($("#end .stitch"));

