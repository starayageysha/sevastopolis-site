const $=s=>document.querySelector(s),app=$('#app'),nav=$('#nav'),P=SITE.pages;
nav.innerHTML=SITE.main.map(k=>`<a href="#${k}">${k=='home'?'Главная':P[k].t}</a>`).join('');
const im=n=>`assets/img/${n}.webp`;
const card=c=>`<div class="card rv${c.ph?' ph':''}">${c.img?`<img src="${im(c.img)}" data-big loading="lazy" alt="${c.t}">`:''}<h3>${c.t}</h3><p>${c.x||''}</p></div>`;
function render(){const id=(location.hash||'#home').slice(1),home=id=='home'||!P[id];document.body.dataset.page=home?'home':'inner';let h;
 if(home)h=`<section class="hero"><picture><source media="(max-aspect-ratio:1/1)" srcset="${im('poster')}"><img class="scene" src="${im('world')}" alt=""></picture><div class="rays"></div><div class="fx"></div><div class="hcont"><img class="logo" src="assets/img/logo.png" alt="СЕВАСТОПОЛИС"><h1>ОТКРОЙ СВОЙ МИР.</h1><p class="lead">ИССЛЕДУЙ. ВСТРЕЧАЙ. СОЗДАВАЙ.</p><div class="row"><a class="btn big" href="#play">НАЧАТЬ ПРИКЛЮЧЕНИЕ</a><a class="btn ghost" href="#about">УЗНАТЬ БОЛЬШЕ</a></div></div></section>
 <section class="sec2"><h2 class="t">Куда отправимся?</h2><div class="grid">${['about','world','heroes','gallery'].map(k=>card({t:P[k].t,x:P[k].lead.slice(0,80)+'…',img:P[k].bg}).replace('<div','<a href="#'+k+'"').replace(/<\/div>$/,'</a>')).join('')}</div></section>`;
 else{const p=P[id];h=`<section class="page"><div class="blur" style="background-image:url(${im(p.bg)})"></div><div class="wrap"><h2 class="t">${p.t}</h2><div class="panel"><p class="lead">${p.lead}</p></div>
 ${p.gallery||p.play||p.profile||p.nofeat?'':`<figure class="feat"><img src="${im(p.bg)}" data-big alt="${p.t}"></figure>`}
 ${p.profile?Auth.view():''}${p.cards?`<div class="grid">${p.cards.map(card).join('')}</div>`:''}${p.gallery?`<div class="grid">${p.gallery.map(g=>card({t:'',img:g})).join('')}</div>`:''}
 ${p.play?Auth.gate():''}${p.play?(SITE.GAME_URL?`<iframe class="game" src="${SITE.GAME_URL}" allowfullscreen></iframe>`:'<a class="btn" href="#home">Скоро</a>'):''}
 <div class="row back"><a class="btn ghost" href="javascript:history.back()">← Назад</a><a class="btn" href="#home">На главную</a></div></div></section>`;}
 app.innerHTML=h;document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.hash=='#'+id));scrollTo(0,0);nav.classList.remove('open');document.title=(home?'Главная':P[id].t)+' — СЕВАСТОПОЛИС';
 post();const io=new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.1});document.querySelectorAll('.rv').forEach(n=>io.observe(n))}
const curt=$('#curtain');let busy=false,pend=false;
function go(){if(busy){pend=true;return}busy=true;curt.classList.add('on');setTimeout(()=>{render();curt.classList.remove('on');curt.classList.add('out');setTimeout(()=>{curt.classList.remove('out');busy=false;if(pend){pend=false;go()}},750)},650)}
function split(el){if(!el||el.dataset.s)return;el.dataset.s=1;let i=0;el.setAttribute('aria-label',el.textContent);el.innerHTML=el.textContent.split(' ').map(w=>`<span class="w">${[...w].map(c=>`<span class="ch" style="--i:${i++}">${c}</span>`).join('')}</span>`).join(' ')}
function fx(el,n){if(!el||el.children.length)return;let h='';for(let k=0;k<n;k++)h+=`<i style="--x:${Math.random()*100}%;--s:${3+Math.random()*7}px;--t:${8+Math.random()*10}s;--d:${-Math.random()*14}s"></i>`;h+='<b class="gull" style="--y:12%;--t:22s;--d:-4s"></b><b class="gull" style="--y:24%;--t:30s;--d:-17s;scale:.7"></b>';el.innerHTML=h}
function post(){document.querySelectorAll('#intro h2,.hero h1,.page .t').forEach(split);document.querySelectorAll('.fx').forEach(e=>fx(e,e.closest('#intro')?16:12));document.querySelectorAll('.rv').forEach((n,i)=>n.style.transitionDelay=(i%6)*90+'ms')}
document.addEventListener('pointermove',e=>{const c=e.pointerType=='mouse'&&e.target.closest&&e.target.closest('.card');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');c.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*8+'deg')});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.card');if(c){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
render();addEventListener('hashchange',go);
const lb=$('#lightbox');document.addEventListener('click',e=>{if(e.target.dataset.big!==undefined){lb.querySelector('img').src=e.target.src;lb.classList.add('on')}else if(lb.contains(e.target))lb.classList.remove('on')});
$('#burger').onclick=()=>nav.classList.toggle('open');
$('#full').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
$('#acct').onclick=()=>Auth.user?location.hash='#profile':Auth.open('login');
$('#lang').onclick=()=>alert('Другие языки будут добавлены позже. Сейчас доступен русский.');
const TR=['title','motif-a','motif-b'].map(n=>`assets/audio/${n}.mp3`),VOL=.5;let cur=null,last=-1,started=false,on=true;
try{if(localStorage.getItem('music')=='off')on=false}catch(e){}
function fade(a,to,ms,end){const s=a.volume,t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/ms);a.volume=Math.max(0,Math.min(1,s+(to-s)*k));k<1?requestAnimationFrame(f):end&&end()})(t0)}
function stopMusic(){if(cur){const o=cur;cur=null;fade(o,0,1800,()=>o.pause())}}
function playRandom(){stopMusic();let i;do i=Math.floor(Math.random()*TR.length);while(i==last&&TR.length>1);last=i;const a=new Audio(TR[i]);a.loop=true;a.volume=0;cur=a;started=false;a.play().then(()=>{started=true;fade(a,VOL,1800)}).catch(()=>{started=false})}
function ui(){$('#music').style.opacity=on?1:.5;$('#introMusic').textContent='♪ Музыка: '+(on?'вкл':'выкл')}
function music(){on=!on;try{localStorage.setItem('music',on?'on':'off')}catch(e){}on?playRandom():stopMusic();ui()}
$('#music').onclick=$('#introMusic').onclick=music;ui();
addEventListener('hashchange',()=>{if(on)playRandom()});
/* Браузеры не разрешают звук до первого касания: музыка стартует сама при первом касании/клике */
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(on&&!started&&!cur)playRandom();else if(on&&cur&&!started)cur.play().then(()=>{started=true;fade(cur,VOL,1800)}).catch(()=>{})},{passive:true}));
if(on)playRandom();
const closeIntro=quick=>{const i=$('#intro');if(i.classList.contains('off')||i.classList.contains('go'))return;try{sessionStorage.setItem('seen',1)}catch(e){}
 if(quick===true){i.classList.add('off');document.body.classList.add('ready');return}i.classList.add('go');setTimeout(()=>{i.classList.add('off');document.body.classList.add('ready')},1100)};
$('#enter').onclick=()=>closeIntro();$('#skip').onclick=()=>closeIntro(true);try{if(sessionStorage.getItem('seen'))closeIntro(true)}catch(e){}
