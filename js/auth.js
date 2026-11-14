/* Регистрация пользователя и игрока.
   SITE.API_URL пустой -> ДЕМО-режим (данные только в этом браузере, для настоящей регистрации нужен сервер).
   SITE.API_URL = 'https://sevastopolis.ru' -> запросы идут на сервер (см. README, раздел «Сервер регистрации»). */
const Auth=(()=>{
const AV={fox:['🦊','Лисёнок'],boy:['👦','Мальчик'],girl:['👧','Девочка'],cat:['🐱','Котик']};
const API=(typeof SITE!=='undefined'&&SITE.API_URL)||'';let user=null,tab='register',step=1,draft={avatar:'fox'},msg='',pend=null;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const st={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
async function H(pw,salt){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+pw));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381;for(const c of salt+pw)h=(h*33^c.charCodeAt(0))>>>0;return'x'+h}}
async function api(p,m,b){const r=await fetch(API+p,{method:m,credentials:'include',headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Ошибка сервера');return j}
const pub=r=>({email:r.email,player:r.player}),users=()=>st.get('sv_users',[]);
const D={
 async register(d){const u=users(),em=d.email.toLowerCase();if(u.some(x=>x.email==em))throw Error('Этот e-mail уже зарегистрирован');if(u.some(x=>x.player.nickname.toLowerCase()==d.nickname.toLowerCase()))throw Error('Это игровое имя занято');const salt=Math.random().toString(36).slice(2),r={email:em,salt,hash:await H(d.password,salt),player:{nickname:d.nickname,avatar:d.avatar,created:Date.now()}};u.push(r);st.set('sv_users',u);st.set('sv_session',em);return pub(r)},
 async login(d){const r=users().find(x=>x.email==d.email.toLowerCase());if(!r||r.hash!=await H(d.password,r.salt))throw Error('Неверный e-mail или пароль');st.set('sv_session',r.email);return pub(r)},
 async me(){const r=users().find(x=>x.email==st.get('sv_session',null));return r?pub(r):null},
 async logout(){st.set('sv_session',null)},
 async save(d){const u=users(),r=u.find(x=>x.email==user.email);if(u.some(x=>x!==r&&x.player.nickname.toLowerCase()==d.nickname.toLowerCase()))throw Error('Это игровое имя занято');Object.assign(r.player,d);st.set('sv_users',u);return pub(r)}};
const S=API?{register:d=>api('/api/register','POST',d).then(j=>j.user),login:d=>api('/api/login','POST',d).then(j=>j.user),me:()=>api('/api/me','GET').then(j=>j.user).catch(()=>null),logout:()=>api('/api/logout','POST'),save:d=>api('/api/player','PATCH',d).then(j=>j.user)}:D;
const okNick=n=>/^[\p{L}\d_-]{3,16}$/u.test(n),okMail=e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
function ui(){const b=$('#acct');if(!b)return;b.textContent=user?AV[user.player.avatar]?.[0]||'🦊':'👤';b.title=user?'Профиль: '+user.player.nickname:'Войти / регистрация'}
function refresh(){ui();if(typeof render=='function'&&/^#(profile|play)$/.test(location.hash))render()}
function open(t){tab=t;step=1;msg='';$('#auth').classList.add('on');paint()}
function close(){$('#auth').classList.remove('on')}
const v=id=>($('#'+id)?.value||'').trim();
function paint(){const e=`<p class="err" id="a_err">${esc(msg)}</p>`;let h=`<div class="ab"><button class="x" data-act="close" aria-label="Закрыть">✕</button><div class="tabs"><button class="${tab=='login'?'on':''}" data-act="tab-login">Вход</button><button class="${tab=='register'?'on':''}" data-act="tab-register">Регистрация</button></div>${API?'':'<p class="demo">Демо-режим: данные хранятся только в этом браузере.</p>'}`;
 if(tab=='login')h+=`<label>E-mail<input id="a_email" type="email" autocomplete="email" value="${esc(draft.email)}"></label><label>Пароль<input id="a_pw" type="password" autocomplete="current-password"></label>${e}<button class="btn" data-act="login">ВОЙТИ</button>`;
 else if(step==1)h+=`<h3>Шаг 1 из 2 · Аккаунт</h3><label>E-mail<input id="a_email" type="email" autocomplete="email" value="${esc(draft.email)}"></label><label>Пароль (от 8 символов)<input id="a_pw" type="password" autocomplete="new-password"></label><label>Повторите пароль<input id="a_pw2" type="password" autocomplete="new-password"></label>
 <label class="ck"><input id="a_age" type="checkbox" ${draft.age?'checked':''}> Мне исполнилось 14 лет, либо есть согласие родителей</label><label class="ck"><input id="a_ok" type="checkbox" ${draft.ok?'checked':''}> Согласен(на) на обработку персональных данных и с <a href="#privacy" data-act="close">политикой конфиденциальности</a></label>${e}<button class="btn" data-act="next">ДАЛЕЕ</button>`;
 else h+=`<h3>Шаг 2 из 2 · Создай игрока</h3><label>Игровое имя (3–16 символов)<input id="a_nick" maxlength="16" value="${esc(draft.nickname)}"></label><div class="avs">${Object.entries(AV).map(([k,a])=>`<button class="av ${draft.avatar==k?'on':''}" data-act="av-${k}"><b>${a[0]}</b>${a[1]}</button>`).join('')}</div>${e}<div class="row"><button class="btn ghost" data-act="back">Назад</button><button class="btn" data-act="register">НАЧАТЬ ИГРУ</button></div>`;
 $('#auth').innerHTML=h+'</div>';const f=$('#auth input');f&&!/Mobi|Android/i.test(navigator.userAgent)&&f.focus()}
function view(){if(!user)return`<div class="panel"><p class="lead">Войдите или зарегистрируйтесь, чтобы создать своего игрока.</p></div><div class="row"><button class="btn" data-act="open-register">РЕГИСТРАЦИЯ</button><button class="btn ghost" data-act="open-login">ВОЙТИ</button></div>`;
 const a=pend||user.player.avatar;return`<div class="panel prof"><div class="bigav">${AV[a][0]}</div><p class="lead">${esc(user.email)}</p><label>Игровое имя<input id="p_nick" maxlength="16" value="${esc(user.player.nickname)}"></label><div class="avs">${Object.entries(AV).map(([k,x])=>`<button class="av ${a==k?'on':''}" data-act="pav-${k}"><b>${x[0]}</b>${x[1]}</button>`).join('')}</div><p class="err" id="p_msg"></p><div class="row"><button class="btn" data-act="save">СОХРАНИТЬ</button><button class="btn ghost" data-act="logout">Выйти</button></div></div>`}
function gate(){return user?`<div class="panel"><p class="lead">Вы вошли как ${AV[user.player.avatar][0]} <b>${esc(user.player.nickname)}</b>.</p></div>`:`<div class="panel"><p class="lead">Чтобы играть, нужны аккаунт и игрок.</p></div><div class="row"><button class="btn" data-act="open-register">РЕГИСТРАЦИЯ</button><button class="btn ghost" data-act="open-login">ВОЙТИ</button></div>`}
const showErr=m=>{msg=m;const x=$('#a_err');x?x.textContent=m:paint()};
async function run(fn){try{showErr('');return await fn()}catch(e){showErr(e.message);return null}}
document.addEventListener('click',async e=>{const a=e.target.closest('[data-act]'),act=a?.dataset.act;if(e.target.id=='auth')return close();if(!act)return;
 if(act=='close')close();else if(act.startsWith('open-'))open(act.slice(5));else if(act.startsWith('tab-')){tab=act.slice(4);step=1;msg='';paint()}
 else if(act=='next'){Object.assign(draft,{email:v('a_email'),age:$('#a_age').checked,ok:$('#a_ok').checked});const p=$('#a_pw').value;msg=!okMail(draft.email)?'Введите корректный e-mail':p.length<8?'Пароль — не короче 8 символов':p!=$('#a_pw2').value?'Пароли не совпадают':!draft.age?'Подтвердите возраст':!draft.ok?'Нужно согласие на обработку данных':'';if(msg)return showErr(msg);draft.password=p;step=2;paint()}
 else if(act=='back'){draft.nickname=v('a_nick');step=1;msg='';paint()}
 else if(act.startsWith('av-')){draft.nickname=v('a_nick');draft.avatar=act.slice(3);paint()}
 else if(act=='register'){draft.nickname=v('a_nick');if(!okNick(draft.nickname))return showErr('Имя: 3–16 букв, цифр, _ или -');const u=await run(()=>S.register({email:draft.email,password:draft.password,nickname:draft.nickname,avatar:draft.avatar,consent:true}));if(u){user=u;draft={avatar:'fox'};close();ui();location.hash=='#profile'?render():location.hash='#profile'}}
 else if(act=='login'){draft.email=v('a_email');const u=await run(()=>S.login({email:draft.email,password:$('#a_pw').value}));if(u){user=u;close();refresh()}}
 else if(act=='logout'){await S.logout();user=null;pend=null;refresh()}
 else if(act.startsWith('pav-')){pend=act.slice(4);render()}
 else if(act=='save'){const n=v('p_nick');if(!okNick(n))return $('#p_msg').textContent='Имя: 3–16 букв, цифр, _ или -';try{user=await S.save({nickname:n,avatar:pend||user.player.avatar});pend=null;refresh()}catch(x){$('#p_msg').textContent=x.message}}});
addEventListener('keydown',e=>e.key=='Escape'&&close());
(async()=>{user=await S.me();ui();refresh()})();
document.addEventListener('DOMContentLoaded',()=>{});
return{view,gate,open,get user(){return user}}})();
