(()=>{
'use strict';
const DW=1280, DH=800, IW=1586, IH=992, CW=1000, CH=600, CM=48;
const app=document.getElementById('app');
if(location.hash==='#fit') app.classList.add('fit');

/* ---------------- content (ring order) ---------------- */
const MAPS=[
 {key:'tower',   label:'TOP',    tag:'STARVOYAGERS', title:'DARK MOON',  desc:'DARK MOON IS A SKY PLATFORM BUILT FOR THE FAR, WITH SUPPORT FOR ORBITALS'},
 {key:'habitat', label:'NEW',    tag:'FARSIDE WORKS',title:'IRON SPINE', desc:'IRON SPINE IS A PRESSURISED TRANSIT HUB LINKING THE FAR SIDE DOCKS TO ORBITALS'},
 {key:'crater',  label:'HOT',    tag:'SURVEY CORPS', title:'ASH SEA',    desc:'ASH SEA IS A CRATER FIELD MAPPED FOR LANDERS, WITH ROUTES LOGGED IN ORBITALS'},
 {key:'crescent',label:'RISING', tag:'DEEP FIELD',   title:'CRESCENT',   desc:'CRESCENT IS A HIGH ORBIT RELAY WATCHING THE DARK LIMB, ROUTED THROUGH ORBITALS'},
 {key:'dish',    label:'LIVE',   tag:'DEEP ARRAY',   title:'LONG EAR',   desc:'LONG EAR IS A LISTENING ARRAY PAST THE FAR SIDE, WITH UPLINK TO ORBITALS'}
];
const N=MAPS.length;
const THUMBS=[ // same order as the carousel, so next/prev steps along the strip; crops from the reference
 {key:'tower',   size:80,    x:-22.5, y:-1},
 {key:'habitat', size:138,   x:-76,   y:-19.7},
 {key:'crater',  size:140,   x:-74,   y:-32},
 {key:'crescent',size:260,   x:-198.8,y:-80.7},
 {key:'dish',    size:90,    x:0,     y:-4.5}];

/* ---------------- slot keyframes (design px, measured) ----------------
   c = card corners TL,TR,BR,BL ; m = image corners ; bt/bb = top/bottom edge bulge (px) */
const S={
 '-3':{c:[-720,430,-440,408,-430,700,-710,722], m:[-900,380,-330,380,-330,736,-900,736], bt:3,bb:1,blur:3,  br:.7},
 '-2':{c:[-60,372,200,392,205,722,-50,728],       m:[-400,348,234,348,234,745,-400,745], bt:3,bb:1,blur:2.4,br:.8},
 '-1':{c:[-240,340,90,257,103,722,-230,745],      m:[-167.9,234.6,571.6,234.6,572,739.5,-167.5,739.5], bt:5,bb:1,blur:0,br:.9},
 '0': {c:[155,237,990,137,1067,640,172,722],      m:[140.5,185.5,1039.2,148.8,1070.6,721,145.8,755.9], bt:15,bb:2,blur:0,br:.9},
 '1': {c:[1067,137,1560,186,1575,558,1142,637],   m:[1051.9,130.4,1886,148.7,1886.2,647.3,1067.4,714], bt:6,bb:2,blur:0,br:.9},
 '2': {c:[930,300,1330,250,1340,600,940,660],     m:[900,290,1540,290,1540,690,900,690], bt:3,bb:1,blur:.8,br:.85},
 '3': {c:[1440,300,1820,262,1830,570,1450,612],   m:[1400,240,2000,240,2000,615,1400,615], bt:3,bb:1,blur:3,br:.7}
};
const SK=[-3,-2,-1,0,1,2,3].map(k=>S[k]);
function cr(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t;return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);}
function slotAt(k){
  k=Math.max(-3,Math.min(3,k)); let i=Math.floor(k+3); if(i>=6)i=5; const t=k+3-i;
  const a=SK[Math.max(0,i-1)],b=SK[i],c=SK[i+1],d=SK[Math.min(6,i+2)];
  const f=key=>cr(a[key],b[key],c[key],d[key],t);
  const arr=key=>b[key].map((_,j)=>cr(a[key][j],b[key][j],c[key][j],d[key][j],t));
  return {c:arr('c'),m:arr('m'),bt:f('bt'),bb:f('bb'),blur:Math.max(0,f('blur')),br:f('br')};
}

/* ---------------- projective maths ---------------- */
function sq2q(q){ // unit square -> quad (TL,TR,BR,BL); returns 3x3
  const [x0,y0,x1,y1,x2,y2,x3,y3]=q;
  const dx1=x1-x2,dy1=y1-y2,dx2=x3-x2,dy2=y3-y2,sx=x0-x1+x2-x3,sy=y0-y1+y2-y3;
  let g=0,h=0; if(Math.abs(sx)>1e-9||Math.abs(sy)>1e-9){const det=dx1*dy2-dx2*dy1;g=(sx*dy2-dx2*sy)/det;h=(dx1*sy-sx*dy1)/det;}
  return [x1-x0+g*x1, x3-x0+h*x3, x0, y1-y0+g*y1, y3-y0+h*y3, y0, g, h, 1];
}
function rect2q(w,h,q){const m=sq2q(q);return [m[0]/w,m[1]/h,m[2],m[3]/w,m[4]/h,m[5],m[6]/w,m[7]/h,1];}
function mul(a,b){const r=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];return r;}
function inv(m){const [a,b,c,d,e,f,g,h,i]=m;const A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C;
  return [A/det,-(b*i-c*h)/det,(b*f-c*e)/det,B/det,(a*i-c*g)/det,-(a*f-c*d)/det,C/det,-(a*h-b*g)/det,(a*e-b*d)/det];}
function m3d(m){return `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,${m[8]})`;}
const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};

/* ---------------- build cards ---------------- */
const cardsEl=document.getElementById('cards');
const cards=MAPS.map((mp,i)=>{
  const slab=document.createElement('div');slab.className='slab';slab.innerHTML='<i></i>';
  const el=document.createElement('div');el.className='card';
  el.innerHTML=`<div class="shape" style="top:${-CM}px;height:${CH+2*CM}px"><div class="img" style="top:${CM}px;background-image:var(--i-${mp.key})"></div></div>`;
  cardsEl.append(slab,el);
  return {el,slab,shape:el.firstChild,img:el.firstChild.firstChild,last:{}};
});

function clipFor(bt,bb){ // curved top/bottom edges in shape-local px
  const n=18,pts=[];
  for(let j=0;j<=n;j++){const t=j/n;pts.push(`${(t*CW).toFixed(1)}px ${(CM-bt*Math.sin(Math.PI*t)).toFixed(2)}px`);}
  for(let j=n;j>=0;j--){const t=j/n;pts.push(`${(t*CW).toFixed(1)}px ${(CM+CH+bb*Math.sin(Math.PI*t)).toFixed(2)}px`);}
  return `polygon(${pts.join(',')})`;
}
const wrap=k=>((((k+N/2)%N)+N)%N)-N/2;

function renderCards(pos){
  cards.forEach((cd,i)=>{
    const k=wrap(i-pos), ak=Math.abs(k), sl=slotAt(k);
    const Hc=rect2q(CW,CH,sl.c), Hi=rect2q(IW,IH,sl.m);
    const rel=mul(inv(Hc),Hi);
    const op=1-smooth(2.05,2.5,ak);
    const z=100-Math.round(ak*10);
    cd.el.style.transform=m3d(Hc); cd.el.style.zIndex=z; cd.el.style.opacity=op.toFixed(3);
    cd.el.style.visibility=op<.002?'hidden':'visible';
    cd.img.style.transform=m3d(rel);
    // edge length in screen px -> local px factor for bulge & blur
    const q=sl.c, sideL=Math.hypot(q[6]-q[0],q[7]-q[1]), sideR=Math.hypot(q[4]-q[2],q[5]-q[3]), top=Math.hypot(q[2]-q[0],q[3]-q[1]);
    const fy=CH/((sideL+sideR)/2), fx=CW/Math.max(1,top);
    const clip=clipFor(sl.bt*fy,sl.bb*fy);
    if(cd.last.clip!==clip){cd.shape.style.clipPath=clip;cd.last.clip=clip;}
    const filt=`brightness(${sl.br.toFixed(3)})`+(sl.blur>.05?` blur(${(sl.blur*fx).toFixed(2)}px)`:'');
    if(cd.last.filt!==filt){cd.shape.style.filter=filt;cd.last.filt=filt;}
    // dark slab under the active card
    const P=(u,v)=>{const tx=lerp(q[0],q[2],u),ty=lerp(q[1],q[3],u),bx=lerp(q[6],q[4],u),by=lerp(q[7],q[5],u);return [lerp(tx,bx,v),lerp(ty,by,v)];};
    const a=P(.615,.2),b=[q[2],q[3]+60],c=[q[4]+2,q[5]+32],d=P(.615,1);d[1]+=31;
    const Hs=rect2q(1000,600,[a[0],a[1],b[0],b[1],c[0],c[1],d[0],d[1]]);
    cd.slab.style.transform=m3d(Hs); cd.slab.style.zIndex=z-1;
    const so=clamp(1-ak*1.4,0,1)*op; cd.slab.style.opacity=so.toFixed(3); cd.slab.style.visibility=so<.002?'hidden':'visible';
  });
}

/* ---------------- orbit rings ---------------- */
const RINGS=[ // measured arcs: circle cx,cy,r, from->to degrees (SVG, y down)
 {c:[418.4,279.7,390.3], a:[-181,-133], st:'url(#gG)', w:1.1, d:'4 4.6'},
 {c:[556.5,297.9,432.7], a:[-192,-19],  st:'rgba(196,210,228,.27)', w:1.2},
 {c:[551.7,324.4,365.5], a:[-172,-108], st:'#f0793a', w:1.5, o:.55, dot:{a:-138.4, t:'o'}},
 {c:[631.5,364.4,419.7], a:[-168,-34],  st:'rgba(205,218,236,.19)', w:1.3, d:'6.2 3.9'},
 {c:[607.2,341.5,358.6], a:[-168,-33],  st:'rgba(205,218,236,.25)', w:1.35},
 {c:[571.8,337.7,268.8], a:[-160,-43.5],st:'rgba(205,218,236,.29)', w:1.35, dot:{a:-143.3, t:'w'}},
 {c:[936.3,323.4,473.6], a:[36,96],     st:'rgba(214,224,238,.26)', w:1.4, d:'7 5.6'},
 {c:[956.9,9.2,723],     a:[95,113],    st:'rgba(214,224,238,.25)', w:1.3, d:'6 5', dot:{a:95.7,t:'p'}}
];
const NS='http://www.w3.org/2000/svg';
const rp=document.getElementById('ringpaths'), rd=document.getElementById('ringdots');
function arcPath(cx,cy,r,a0,a1){const p=a=>[cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)];
  const [x0,y0]=p(a0),[x1,y1]=p(a1);const large=Math.abs(a1-a0)>180?1:0;return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;}
function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent.appendChild(e);return e;}
function spline(pts){ // Catmull-Rom through measured points -> cubic Beziers
  let d=`M${pts[0][0]} ${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    d+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(2)} ${(p1[1]+(p2[1]-p0[1])/6).toFixed(2)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(2)} ${(p2[1]-(p3[1]-p1[1])/6).toFixed(2)} ${p2[0]} ${p2[1]}`;}
  return d;}
/* big orange orbit: faded upper arc + lower sweep meeting it at (27.5,261) */
mk('path',{d:arcPath(335.4,250,305.3,178.1,236.5),stroke:'url(#gL)','stroke-width':1.6},rp);
const orb=mk('path',{d:spline([[27.5,261],[95,333.3],[163.3,380],[300,478],[460,598],[639.5,687.5],[664.0,705.5],[695.5,725.0],[720.0,737.0],[752.0,749.0],[782.0,759.0],[811.5,766.0],[834.0,770.0],[879.0,774.0],[914.0,775.0],[968.5,771.0],[991.0,767.0],[1016.0,757.0],[1058.0,749.0],[1090.5,739.0],[1140,722],[1183,699],[1265,620],[1300,572]]),stroke:'#f27a38','stroke-width':1.5,'stroke-opacity':.62},rp);
const dotEls=[];
RINGS.forEach(r=>{
  const at={d:arcPath(r.c[0],r.c[1],r.c[2],r.a[0],r.a[1]),stroke:r.st,'stroke-width':r.w};
  if(r.d)at['stroke-dasharray']=r.d; if(r.o)at['stroke-opacity']=r.o;
  mk('path',at,rp);
  if(r.dot){const sty={o:{fill:'rgba(150,138,126,.42)',stroke:'#dc7a45'},w:{fill:'rgba(135,160,190,.42)',stroke:'#c9d4e2'},p:{fill:'#b98b6c',stroke:'#e58c57'}}[r.dot.t];
    const e=mk('circle',{r:6.4,fill:sty.fill,stroke:sty.stroke,'stroke-width':1.4},rd);dotEls.push({e,ring:r,a0:r.dot.a});}
});
const edot=mk('circle',{r:6.4,fill:'rgba(150,130,112,.45)',stroke:'#e0773f','stroke-width':1.4},rd);
const ORBL=orb.getTotalLength();
const ORB0=(()=>{let best=0,bd=1e9;for(let l=0;l<ORBL;l+=0.5){const p=orb.getPointAtLength(l),d=Math.hypot(p.x-1183,p.y-699);if(d<bd){bd=d;best=l;}}return best;})();
function renderDots(pos){
  dotEls.forEach(d=>{const a=(d.a0+pos*5.5)*Math.PI/180,[cx,cy,r]=d.ring.c;d.e.setAttribute('cx',(cx+r*Math.cos(a)).toFixed(2));d.e.setAttribute('cy',(cy+r*Math.sin(a)).toFixed(2));});
  const L=((ORB0-pos*38)%ORBL+ORBL)%ORBL, p=orb.getPointAtLength(L); edot.setAttribute('cx',p.x.toFixed(2)); edot.setAttribute('cy',p.y.toFixed(2));
}

/* ---------------- thumbnails ---------------- */
const thumbsEl=document.getElementById('thumbs');
const thumbEls=THUMBS.map((t,i)=>{
  const b=document.createElement('button');b.className='thumb';b.setAttribute('aria-label','Show '+MAPS.find(m=>m.key===t.key).title);
  b.style.left=(870.6+i*56.2)+'px';
  b.style.backgroundImage=`var(--i-${t.key})`;b.style.backgroundSize=`${t.size}px auto`;b.style.backgroundPosition=`${t.x}px ${t.y}px`;
  thumbsEl.appendChild(b);return b;});
let focusThumb=4; thumbEls[focusThumb].classList.add('is-focus');
thumbEls.forEach((b,i)=>{
  b.addEventListener('pointerenter',()=>{thumbEls[focusThumb].classList.remove('is-focus');focusThumb=i;b.classList.add('is-focus');});
  b.addEventListener('click',()=>goTo(MAPS.findIndex(m=>m.key===THUMBS[i].key)));
});

/* ---------------- responsive layout ---------------- */
const scene=document.getElementById('scene'), deck=document.getElementById('deck'), rule=document.getElementById('rule');
const G={tl:g('g-tl'),tc:g('g-tc'),tr:g('g-tr'),r:g('g-r'),bl:g('g-bl'),br:g('g-br')};
function g(id){return document.getElementById(id);}
let U=1, deckS=1, deckX=0, deckY=0, headerY=100;
function place(el,s,ax,ay,vx,vy){el.style.transform=`translate(${(vx-ax*s).toFixed(3)}px,${(vy-ay*s).toFixed(3)}px) scale(${s})`;}
function layout(){
  const vw=app.clientWidth, vh=app.clientHeight;
  const cover=Math.max(vw/DW,vh/DH), contain=Math.min(vw/DW,vh/DH);
  U=Math.min(cover,Math.max(contain,Math.min(vw/900,vh/560)));
  const arch=getComputedStyle(app).getPropertyValue('--arch').trim();
  if(arch!=='mobile'&&menuOpen) setMenu(false,false);
  if(arch==='tablet'){ layoutTablet(vw,vh,cover); return; }
  if(arch==='mobile'){ layoutMobile(vw,vh,cover,getComputedStyle(app).getPropertyValue('--mob').trim()); return; }
  {
    place(scene,cover,DW/2,DH/2,vw/2,vh/2); place(deck,cover,DW/2,DH/2,vw/2,vh/2);
    deckS=cover; deckX=vw/2-DW/2*cover; deckY=vh/2-DH/2*cover;
    place(G.tl,U,0,0,0,0); place(G.tc,U,DW/2,0,vw/2,0); place(G.tr,U,DW,0,vw,0);
    place(G.r,U,DW,DH/2,vw,vh/2); place(G.bl,U,0,DH,0,vh); place(G.br,U,DW,DH,vw,vh);
    G.tr.style.display='';
    rule.style.top=(99*U)+'px'; rule.style.height=(2*U)+'px'; headerY=101*U;
  }
  document.documentElement.style.setProperty('--u',U);
  document.getElementById('dcur').style.width=document.getElementById('dcur').style.height=(50*Math.max(.75,Math.min(U,1.6)))+'px';
  const cs=50*Math.max(.75,Math.min(U,1.6));dcur.style.margin=`${-cs/2}px 0 0 ${-cs/2}px`;dcur.querySelector('svg').style.transform=`scale(${cs/50})`;
}
/* Tablet: same components, re-composed for the space.
   T  = interface scale (same proportions as desktop, sized for reading distance)
   ds = carousel scale, chosen so the whole main card is framed with its neighbours peeking
        and the arrow pair keeps its desktop position over the right-hand neighbour. */
function layoutTablet(vw,vh,cover){
  const T=clamp(Math.min(vw/786,vh/800),.8,1.35);           // 786 = text column + gap + thumbnails (desktop row)
  const header=101*T, gap=36*T, textTop=vh-291*T;          // 291 = TOP label -> bottom edge (desktop)
  const ds=Math.min((vw-160*T)/912, (vh-215*T)/585);        // 912x585 = main card; 160 = side margin + arrows
  const cardW=912*ds, cardH=585*ds;
  const free=textTop-gap-(header+gap);                        // room between header and content block
  const cardTop=header+gap+Math.max(0,(free-cardH)/2);        // centred when it fits, desktop-style overlap when not
  const cardLeft=48*T+Math.max(0,(vw-160*T-cardW)/2);
  deckS=ds; deckX=cardLeft-155*ds; deckY=cardTop-137*ds;
  place(scene,cover,DW/2,DH/2,vw/2,vh/2);
  place(deck,ds,0,0,deckX,deckY);
  U=T;
  place(G.tl,T,0,0,0,0);
  // nav stays centred like desktop while it clears the logo; otherwise it slides right
  const navX=Math.min(Math.max(vw/2,(168+48+640-475)*T), vw-(52+792-640)*T);
  place(G.tc,T,640,0,navX,0);
  place(G.tr,T,DW,0,vw,0); G.tr.style.display='';
  place(G.r,T,DW,431,vw,cardTop+(430-137)*ds);                // arrow pair centred on the card
  const textLeft=Math.min(Math.max(26*T,cardLeft-29*T), vw-760.4*T); // desktop offset from the card, never into the thumbnails
  place(G.bl,T,126,DH,textLeft,vh);
  place(G.br,T,DW,DH,vw,vh);
  rule.style.top=(99*T)+'px'; rule.style.height=(2*T)+'px'; headerY=101*T;
  document.documentElement.style.setProperty('--u',T);
  const cs=50*Math.max(.75,Math.min(T,1.6));
  dcur.style.width=dcur.style.height=cs+'px'; dcur.style.margin=`${-cs/2}px 0 0 ${-cs/2}px`; dcur.querySelector('svg').style.transform=`scale(${cs/50})`;
}
/* Mobile: same components again, re-composed for a phone.
   stack (portrait): header | carousel with the right-hand neighbour carrying the arrows | heading, copy, CTA |
                     "see all maps" + thumbnails bottom-right (the desktop diagonal, stacked)
   split (landscape): header | content column left, carousel right, see all + thumbnails bottom-right with the CTA on their row
   M = interface scale: as large as the widest title allows (headings never wrap), floor 0.8.        */
let TITLE_W=360;
function measureTitles(){
  const el=TX.title, sx=parseFloat(((el.getAttribute('style')||'').match(/scaleX\(([^)]+)\)/)||[0,1])[1]);
  const probe=el.cloneNode(true); probe.removeAttribute('id'); probe.style.visibility='hidden'; probe.style.transition='none';
  el.parentNode.appendChild(probe); let w=0;
  MAPS.forEach(mp=>{probe.textContent=mp.title; w=Math.max(w,probe.offsetWidth*sx);});
  probe.remove(); TITLE_W=Math.ceil(w)+4;
}
function safeArea(){const s=getComputedStyle(document.getElementById('safe'));
  return {t:parseFloat(s.paddingTop)||0,r:parseFloat(s.paddingRight)||0,b:parseFloat(s.paddingBottom)||0,l:parseFloat(s.paddingLeft)||0};}
function layoutMobile(vw,vh,cover,mode){
  const sa=safeArea(), L=sa.l, R=sa.r;
  const split=mode==='split';
  const m=split?clamp((vw-L-R)*0.035,14,24):clamp((vw-L-R)*0.05,16,28);   // outer margin (landscape needs less)
  const A=46/66.4;                                     // arrows ~46px across: comfortable touch targets
  const peek=66.4*A+12;                                // visible strip of the next card that carries them
  const M=split?clamp(Math.min((vh-sa.t-sa.b)/430,(vw-L-R)/940),.86,1.1)   // .86 keeps body copy near 11px
               :clamp((vw-L-R-2*m)/TITLE_W,.8,1.2);
  const h=split?clamp(M*.62,.5,.7):clamp(M*.7,.56,.8);  // header scale (logo keeps its proportions)
  const pad=split?10:14, gap=split?10:Math.max(14,22*M);
  const headTop=sa.t+pad, headerBottom=headTop+47.8*h+pad;
  const bottom=vh-sa.b-(split?Math.max(12,m*.75):Math.max(16,m));
  place(scene,cover,DW/2,DH/2,vw/2,vh/2);
  G.tc.style.transform=''; G.tr.style.display='';
  place(G.tl,h,25.9,31.3,L+m,headTop);
  place(G.tr,h,1254,55.2,vw-R-m,headTop+(55.2-31.3)*h);   // burger centred on the logo box
  rule.style.top=headerBottom+'px'; rule.style.height=Math.max(1,2*h)+'px'; headerY=headerBottom+1;
  app.style.setProperty('--menu-top',(headerBottom+Math.max(18,vh*.035))+'px');
  app.style.setProperty('--menu-x',(L+m)+'px');
  app.style.setProperty('--menu-fs',clamp(Math.min(vw*.11,(vh-headerBottom)*.105),26,56)+'px');
  let ds,cardLeft,cardRight,cardTop;
  if(split){
    // desktop relations kept: see all + thumbnails in the bottom-right corner, CTA on the thumbnail row,
    // content column on the left, carousel above the controls on the right
    const ctrlBottom=bottom-(752.3-743.3)*M, ctrlTop=ctrlBottom-(743.3-668)*M;
    place(G.br,M,1142,743.3,vw-R-m,ctrlBottom);
    place(G.bl,M,126,752.3,L+m,bottom);
    const colR=L+m+Math.max(TITLE_W,320)*M+Math.max(20,28*M);
    const top0=headerBottom+gap, bot0=ctrlTop-gap;
    ds=Math.min((vw-R-peek-colR)/912,(bot0-top0)/585);
    cardRight=vw-R-peek; cardLeft=cardRight-912*ds;
    cardTop=top0+Math.max(0,(bot0-top0-585*ds)/2);
  }else{
    place(G.br,M,1142,743.3,vw-R-m,bottom);                    // see all + thumbnails, bottom-right as on desktop
    const ctrlTop=bottom-(743.3-668)*M, ctaBottom=ctrlTop-18*M;
    place(G.bl,M,126,752.3,L+m,ctaBottom);                     // heading, copy and CTA sit above them
    const contentTop=ctaBottom-(752.3-505)*M;
    const top0=headerBottom+gap, bot0=contentTop-gap, overlap=95*M; // short screens: label line may overlap the card, as on desktop
    ds=Math.min((vw-R-peek-(L+m))/912,(bot0+overlap-top0)/585);
    cardLeft=L+m+Math.max(0,(vw-R-peek-(L+m)-912*ds)/2); cardRight=cardLeft+912*ds;
    cardTop=top0+Math.max(0,(bot0-top0-585*ds)/2);
  }
  deckS=ds; deckX=cardLeft-155*ds; deckY=cardTop-137*ds;
  place(deck,ds,0,0,deckX,deckY);
  place(G.r,A,1209.8,431,(cardRight+vw-R)/2,cardTop+(430-137)*ds);
  U=M; document.documentElement.style.setProperty('--u',M);
  const cs=50*clamp(M,.75,1.6);
  dcur.style.width=dcur.style.height=cs+'px'; dcur.style.margin=`${-cs/2}px 0 0 ${-cs/2}px`; dcur.querySelector('svg').style.transform=`scale(${cs/50})`;
}
const dcur=document.getElementById('dcur');
window.addEventListener('resize',layout);

/* ---------------- text transitions ---------------- */
const pill=document.getElementById('pill');
const TX={top:document.getElementById('t-top'),tag:document.getElementById('t-tag'),title:document.getElementById('t-title'),desc:document.getElementById('t-desc')};
const BASE={};for(const k in TX){BASE[k]=TX[k].getAttribute('style');}
let pillExtra=null, pillGap=null;
function sizePill(tagEl,topEl){
  const tw=tagEl.offsetWidth, topR=parseFloat(topEl.style.left)+topEl.offsetWidth;
  if(pillExtra===null){pillExtra=118-tw; pillGap=203.5-topR; TAGOFF=parseFloat(tagEl.style.left)-203.5;}
  const left=topR+pillGap;
  pill.style.left=left+'px'; pill.style.width=(tw+pillExtra)+'px';
  tagEl.style.left=(left+TAGOFF)+'px';
}
let TAGOFF=0;
function swap(k,text,dir){
  const cur=TX[k], nu=cur.cloneNode(true); nu.removeAttribute('id'); nu.textContent=text;
  nu.style.transition='none'; nu.style.transform=(cur.style.transform||'').replace(/translateY\([^)]*\)/,'')+` translateY(${dir*105}%)`;
  cur.parentNode.appendChild(nu); void nu.offsetWidth;
  const baseT=(BASE[k].match(/transform:([^;]*)/)||[])[1]||'';
  nu.style.transition=''; nu.style.transitionDelay=(k==='title'?.08:k==='desc'?.14:.04)+'s';
  nu.style.transform=baseT+' translateY(0)';
  cur.style.transform=baseT+` translateY(${-dir*105}%)`; cur.style.opacity='0';
  const old=cur; setTimeout(()=>old.remove(),900); nu.id=old.id; old.removeAttribute('id'); TX[k]=nu;
  return nu;
}
let shown=0;
function showText(idx,dir){
  if(idx===shown)return; shown=idx; const mp=MAPS[idx];
  const top=swap('top',mp.label,dir), tag=swap('tag',mp.tag,dir); swap('title',mp.title,dir); swap('desc',mp.desc,dir);
  sizePill(tag,top);
  thumbEls.forEach((b,i)=>b.classList.toggle('is-active',THUMBS[i].key===mp.key));
}

/* ---------------- motion + drag (matches the reference video) ---------------- */
let pos=0, target=0, dragging=false, dragStartX=0, dragStartPos=0, lastX=0, lastT=0, vel=0, moved=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPAN=560; // design px of pointer travel per card
function goTo(idx){ // shortest way round the ring
  const cur=Math.round(target); const d=wrap(idx-cur); target=cur+Math.round(d); commit();}
function commit(){const idx=((Math.round(target)%N)+N)%N; const dir=Math.sign(target-pos)||1; showText(idx,dir);}
const hit=document.getElementById('deckhit');
hit.addEventListener('pointerdown',e=>{
  if(e.button!==0)return; dragging=true; moved=0; hit.setPointerCapture(e.pointerId);
  dragStartX=lastX=e.clientX; lastT=performance.now(); dragStartPos=target=pos; vel=0; app.classList.add('is-dragging');
});
hit.addEventListener('pointermove',e=>{
  if(!dragging)return; const now=performance.now(), dx=e.clientX-dragStartX; moved=Math.max(moved,Math.abs(dx));
  const dt=Math.max(1,now-lastT); vel=lerp(vel,(e.clientX-lastX)/dt,.35); lastX=e.clientX; lastT=now;
  target=dragStartPos-dx/(SPAN*deckS);
});
function endDrag(e){
  if(!dragging)return; dragging=false; app.classList.remove('is-dragging');
  const delta=target-dragStartPos, flick=-vel/(SPAN*deckS)*260;
  let dest;
  if(moved<6){ // click: jump to the card that was clicked
    const x=(e.clientX-deckX)/deckS; dest=Math.round(dragStartPos)+(x<150?-1:x>1070?1:0);
  }else if(Math.abs(delta+flick)<0.12){dest=Math.round(dragStartPos);}
  else{dest=Math.round(dragStartPos)+Math.sign(delta+flick)*Math.max(1,Math.round(Math.abs(delta+flick*.5)));}
  target=dest; commit();
}
hit.addEventListener('pointerup',endDrag); hit.addEventListener('pointercancel',endDrag);
document.querySelector('.arrow.next').addEventListener('click',()=>{target=Math.round(target)+1;commit();});
document.querySelector('.arrow.prev').addEventListener('click',()=>{target=Math.round(target)-1;commit();});
window.addEventListener('keydown',e=>{if(menuOpen)return;if(e.key==='ArrowRight'){target=Math.round(target)+1;commit();}if(e.key==='ArrowLeft'){target=Math.round(target)-1;commit();}});
let wheelLock=0;
window.addEventListener('wheel',e=>{if(menuOpen)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY; const now=performance.now();
  if(Math.abs(d)>12&&now>wheelLock){wheelLock=now+650;target=Math.round(target)+Math.sign(d);commit();}},{passive:true});
document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

/* drag cursor: follows the pointer over the carousel, hides over controls */
const fine=matchMedia('(pointer:fine)').matches;
let cx=-100,cy=-100,tx=-100,ty=-100,cs=0,cts=0,press=1,pressT=1;
if(fine){app.classList.add('has-dcur');
  window.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;
    const overDeck=e.target===hit&&e.clientY>headerY; cts=overDeck?1:0; hit.style.cursor=(e.target===hit&&!overDeck)?'default':''; if(cx<-50){cx=tx;cy=ty;}});
  document.addEventListener('pointerleave',()=>cts=0);
  hit.addEventListener('pointerdown',()=>pressT=.86); window.addEventListener('pointerup',()=>pressT=1);
}

let lastFrame=performance.now(), lastPos=null;
function frame(now){
  const dt=Math.min(64,now-lastFrame)/1000; lastFrame=now;
  const rate=dragging?11:5.2;
  pos=reduce&&!dragging?target:lerp(pos,target,1-Math.exp(-rate*dt));
  if(Math.abs(pos-target)<1e-4)pos=target;
  if(pos!==lastPos){renderCards(pos);renderDots(pos);lastPos=pos;}
  if(fine){cx=lerp(cx,tx,1-Math.exp(-28*dt));cy=lerp(cy,ty,1-Math.exp(-28*dt));cs=lerp(cs,cts,1-Math.exp(-16*dt));press=lerp(press,pressT,1-Math.exp(-20*dt));
    const tilt=dragging?clamp(vel*6,-14,14):0;
    dcur.style.transform=`translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) scale(${(cs*press).toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;}
  requestAnimationFrame(frame);
}
/* ---------------- mobile menu ---------------- */
const burger=document.getElementById('burger'), navEl=document.getElementById('nav');
let menuOpen=false;
function setMenu(open,restoreFocus){
  menuOpen=open; app.classList.toggle('menu-open',open);
  burger.setAttribute('aria-expanded',String(open)); burger.setAttribute('aria-label',open?'Close menu':'Open menu');
  if(open) setTimeout(()=>navEl.querySelector('a').focus({preventScroll:true}),80);
  else if(restoreFocus) burger.focus({preventScroll:true});
}
burger.addEventListener('click',()=>setMenu(!menuOpen,true));
navEl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(menuOpen)setMenu(false,true);}));
G.tc.addEventListener('click',e=>{if(menuOpen&&e.target===G.tc)setMenu(false,true);});   // tap outside the links
window.addEventListener('keydown',e=>{
  if(!menuOpen)return;
  if(e.key==='Escape'){e.preventDefault();setMenu(false,true);return;}
  if(e.key==='Tab'){ // keep focus inside the open menu: burger (close) + links
    const f=[burger,...navEl.querySelectorAll('a')], i=f.indexOf(document.activeElement);
    e.preventDefault(); f[e.shiftKey?(i<=0?f.length-1:i-1):(i<0||i===f.length-1?0:i+1)].focus();
  }
},true);

layout(); renderCards(0); renderDots(0);
thumbEls[0].classList.add('is-active');
document.fonts.ready.then(()=>{sizePill(TX.tag,TX.top);measureTitles();layout();});
requestAnimationFrame(frame);
/* =====================================================================================
   ENTRANCE — plays once on first load, then the page is exactly the static design.
   Hierarchy: hero card + title (primary) > eyebrow, copy, CTA (supporting) >
              arrows, thumbnails, nav (controls) > header lines, orbits, dots (frame/decoration).
   Motion language (4 behaviours, all resolving to the authored state):
     DRAW   hairlines and orbit lines trace themselves on          (frame, orbits)
     WIPE   curved-edge reveal upward, image settling inside        (cards) / edge wipes (logo, pill)
     ROLL   text rises out of its mask with the site's own easing   (label, tag, title, copy)
     SETTLE small rise with a fade (nav, CTA, thumbnails); round controls open as an iris; orbit dots settle
   The background stage (image, haze, vignette) is never animated.
   ===================================================================================== */
(function(){
  const root=document.documentElement;
  if(!root.classList.contains('intro-pending'))return;            // reduced motion / no WAAPI: already static
  window.__orbitalsIntro=true;                                      // tells the head failsafe we have it
  const EXPO='cubic-bezier(.19,1,.22,1)',                           // the site's existing text curve
        WIPE='cubic-bezier(.55,0,.1,1)', DRAW='cubic-bezier(.45,0,.15,1)', SETTLE='cubic-bezier(.22,1,.36,1)';
  const ADD=!!(window.KeyframeEffect&&'composite' in KeyframeEffect.prototype);
  const T={frame:0,orbits:.1,hero:.2,nav:.34,depth:.44,context:.56,title:.64,copy:.84,action:.96,controls:1.02,details:1.2};
  const anims=[];
  const play=(el,kf,at,dur,ease,opt)=>{ if(!el)return;
    anims.push(el.animate(kf,Object.assign({delay:at*1000,duration:dur*1000,easing:ease,fill:'backwards'},opt))); };
  // opacity always replaces; transforms are *added* on top of the authored/JS transforms so nothing is overwritten
  const fade=(el,at,dur,ease)=>play(el,[{opacity:0},{opacity:1}],at,dur,ease);
  const move=(el,from,to,at,dur,ease)=>{ if(ADD) play(el,[{transform:from},{transform:to}],at,dur,ease,{composite:'add'}); };
  const settle=(el,from,at,dur,ease)=>{ fade(el,at,dur*.7,'ease-out'); move(el,from,'translate(0,0) scale(1)',at,dur,ease); };
  // round controls open like an iris: clip-only, so nothing is ever re-rasterized at another scale
  const iris=(el,at,dur)=>{ play(el,[{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(71% at 50% 50%)'}],at,dur,SETTLE); fade(el,at,dur*.5,'ease-out'); };
  const roll=(el,at,dur)=>{ if(!el)return; const d=el.parentNode.clientHeight-el.offsetTop+2;   // fully below its mask
    if(ADD) move(el,`translateY(${d}px)`,'translateY(0)',at,dur,EXPO); else fade(el,at,dur,EXPO); };

  function start(){
    if(!root.classList.contains('intro-pending'))return;
    const mobile=getComputedStyle(app).getPropertyValue('--arch').trim()==='mobile';

    /* FRAME — the header hairline draws across, the logo is wiped in */
    play(rule,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],T.frame+.05,1.1,WIPE);
    play(document.querySelector('.logo'),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],T.frame+.1,.9,WIPE);
    iris(burger,T.frame+.35,.7);

    /* ORBITS — inner to outer; solid lines trace, dashed lines slide into their pattern */
    const paths=[...document.getElementById('ringpaths').children];
    [7,6,5,4,3,2,0,1,8,9].forEach((i,n)=>{ const p=paths[i]; if(!p)return; const at=T.orbits+n*.07;
      if(p.getAttribute('stroke-dasharray')){
        play(p,[{opacity:0,strokeDashoffset:40},{opacity:1,strokeDashoffset:0}],at,1.4,DRAW);
      }else{ const L=p.getTotalLength();
        play(p,[{strokeDasharray:`${L} ${L}`,strokeDashoffset:L},{strokeDasharray:`${L} ${L}`,strokeDashoffset:0}],at,1.6,DRAW); }
    });

    /* HERO + DEPTH — the main card wipes up along its curved outline, image settling inside;
       neighbours follow outward, so the ring of cards assembles from the centre */
    cards.forEach((cd,i)=>{ const ak=Math.abs(Math.round(wrap(i-pos))); const clip=cd.last.clip; if(!clip)return;
      const at=ak===0?T.hero:T.depth+(ak-1)*.12;
      const pts=clip.match(/-?[\d.]+px -?[\d.]+px/g), n=pts.length/2;
      const shut=pts.map((p,j)=>j<n?p.split(' ')[0]+' '+pts[pts.length-1-j].split(' ')[1]:p);   // top edge folded onto bottom edge
      play(cd.shape,[{clipPath:`polygon(${shut.join(',')})`},{clipPath:clip}],at,ak===0?1.05:.9,WIPE);
      move(cd.img,'translate(793px,496px) scale(1.08) translate(-793px,-496px)','translate(793px,496px) scale(1) translate(-793px,-496px)',at,ak===0?1.5:1.3,SETTLE);
      if(ak===0) fade(cd.slab.firstChild,T.action,.6,'ease-out');
    });

    /* NAV — understated, after the hero has started */
    if(!mobile) navEl.querySelectorAll('a').forEach((a,k)=>settle(a,'translateY(10px)',T.nav+k*.05,.8,EXPO));

    /* CONTEXT → TITLE → COPY — the eyebrow sets up the headline, the copy follows it */
    fade(document.querySelector('.shade'),T.context-.12,1.0,'ease-out');
    iris(document.querySelector('.odot'),T.context,.6);
    roll(TX.top,T.context+.04,.8);
    play(pill,[{clipPath:'inset(0 100% 0 0 round 6px)'},{clipPath:'inset(0 0% 0 0 round 6px)'}],T.context+.08,.7,WIPE);
    roll(TX.tag,T.context+.16,.7);
    roll(TX.title,T.title,1.0);
    roll(TX.desc,T.copy,.9);

    /* ACTION + CONTROLS */
    settle(document.getElementById('btn'),'translateY(14px)',T.action,.8,EXPO);
    document.querySelectorAll('.arrow').forEach((a,k)=>iris(a,T.controls+k*.08,.8));
    settle(document.querySelector('.see'),'translateY(8px)',T.controls+.06,.7,EXPO);
    thumbEls.forEach((b,k)=>settle(b,'translateY(12px)',T.controls+.1+k*.05,.7,EXPO));

    /* DETAILS — orbit markers land last */
    [...document.getElementById('ringdots').children].forEach((c,k)=>settle(c,'scale(.4)',T.details+k*.06,.6,SETTLE));

    root.classList.remove('intro-pending');        // same frame as the start states: no flash
    const finishNow=()=>anims.forEach(a=>{try{a.finish()}catch(e){}});   // any interaction jumps to the final design
    const evs=['pointerdown','keydown','wheel'];
    evs.forEach(ev=>window.addEventListener(ev,finishNow,{capture:true,passive:true}));
    Promise.all(anims.map(a=>a.finished.catch(()=>{}))).then(()=>{
      anims.forEach(a=>a.cancel());                // effects end at the authored state; release them entirely
      const r=document.getElementById('rings');    // one full repaint of the line art (the draw-on repainted it piecemeal)
      r.style.display='none'; void r.getBoundingClientRect(); r.style.display='';
      evs.forEach(ev=>window.removeEventListener(ev,finishNow,{capture:true}));
    });
  }
  const decodeHero=()=>{ const m=getComputedStyle(root).getPropertyValue('--i-tower').match(/url\(["']?([^"')]+)/);
    if(!m)return Promise.resolve(); const im=new Image(); im.src=m[1]; return im.decode?im.decode().catch(()=>{}):Promise.resolve(); };
  const whenVisible=()=>document.visibilityState==='visible'?Promise.resolve():
    new Promise(r=>document.addEventListener('visibilitychange',function f(){if(document.visibilityState==='visible'){document.removeEventListener('visibilitychange',f);r();}}));
  Promise.race([Promise.all([document.fonts.ready,decodeHero()]),new Promise(r=>setTimeout(r,1500))])
    .then(whenVisible).then(()=>requestAnimationFrame(()=>{try{start()}catch(e){root.classList.remove('intro-pending');}}));
})();
window.__orbitals={setPos:p=>{pos=target=p;renderCards(p);renderDots(p);lastPos=p;}};
})();
