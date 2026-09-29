const $=id=>document.getElementById(id);
const icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let profile=null, socket=null, connected=false, selected=5, queued=null, game=null, modalType=null, sound=false, audio=null, lastGame=null, reconnectTimer, toastTimer, focusBeforeModal;
let sessionToken=null;
try{sessionToken=localStorage.getItem('carrom-session');}catch{}
let lobbyStats={online:0,counts:{}}, drag=null, rafTime=0;
const queryTier=Number(new URL(location.href).searchParams.get('tier'));if([2,5,10,25].includes(queryTier))selected=queryTier;
function send(data){if(socket?.readyState===WebSocket.OPEN){socket.send(JSON.stringify(data));return true;}toast('Reconnecting to the club. Please try again in a moment.');return false;}
function toast(message){$('toast').textContent=message;$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),4500);}
function beep(freq=400,duration=.06){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
function setModal(html,type){focusBeforeModal=document.activeElement;modalType=type;$('modalContent').innerHTML=html;$('modalBackdrop').classList.remove('hidden');document.body.style.overflow='hidden';setTimeout(()=>{const el=$('modalContent').querySelector('input:not([readonly]),button');(el||$('modalClose')).focus();},50);}
function hideModal(){modalType=null;$('modalBackdrop').classList.add('hidden');document.body.style.overflow='';focusBeforeModal?.focus?.();}
function closeModal(){if(modalType==='queue'){send({type:'cancel'});queued=null;}if(modalType==='result'){goLobby();}hideModal();}
$('modalClose').onclick=closeModal;$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))closeModal();};
document.addEventListener('keydown',e=>{if($('modalBackdrop').classList.contains('hidden'))return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){const els=[...$('modalBackdrop').querySelectorAll('button:not(:disabled),input,a[href]')];const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
function renderTiers(){
 $('tierGrid').innerHTML=[2,5,10,25].map((n,i)=>`<button class="tier ${selected===n?'selected':''}" data-tier="${n}" aria-pressed="${selected===n}" aria-label="Choose simulated ${n} rupee entry tier"><div class="tier-top"><span class="coin-stack">${'<i></i>'.repeat(i+1)}</span><span class="radio"></span></div><div class="tier-amount">₹${n}<small>entry</small></div><div class="tier-bottom"><span>${(lobbyStats.counts[n]||0)>0?`${lobbyStats.counts[n]} waiting`:'Open table'}</span><strong>₹${n*2} prize</strong></div></button>`).join('');
 $('tierGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>{selected=+b.dataset.tier;renderTiers();beep(520,.025);});$('entryLabel').textContent='₹'+selected;$('prizeLabel').textContent='₹'+selected*2;
}
function updateProfile(p){profile=p;$('headerBalance').textContent=p.balance.toFixed(2);$('clubBalance').textContent=p.balance;$('playerName').textContent=p.name;$('playedCount').textContent=p.played;$('winsCount').textContent=p.wins;document.querySelectorAll('.profile-avatar,#profileBtn').forEach(el=>el.textContent=p.name.charAt(0).toUpperCase());if(modalType==='wallet')wallet();}
function connect(){
 socket=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}`,sessionToken?['carrom',sessionToken]:[]);
 socket.onopen=()=>{connected=true;$('connectionText').textContent='Connected to the club';$('findBtn').disabled=false;if(queued)send({type:'join',stake:queued.stake});};
 socket.onclose=()=>{connected=false;$('connectionText').textContent='Reconnecting…';$('findBtn').disabled=true;if(game){$('turnLabel').textContent='Reconnecting…';$('shootBtn').disabled=true;}clearTimeout(reconnectTimer);reconnectTimer=setTimeout(connect,1800);};
 socket.onerror=()=>{};
 socket.onmessage=e=>{
  const m=JSON.parse(e.data);
  if(m.type==='profile')updateProfile(m.profile);
  if(m.type==='stats'){lobbyStats=m;$('onlineCount').textContent=m.online;renderTiers();}
  if(m.type==='error')toast(m.message);
  if(m.type==='idle'&&game){goLobby();hideModal();toast('Your previous match has ended. Check your wallet for the final balance.');}
  if(m.type==='queued'){queued={stake:m.stake,since:m.since};queueModal();}
  if(m.type==='cancelled'){queued=null;if(modalType==='queue')hideModal();}
  if(m.type==='game'){
   const isNew=!game||game.id!==m.id;const previous=game;
   game=m;queued=null;
   if(isNew){hideModal();$('lobby').classList.add('hidden');$('gameView').classList.remove('hidden');$('crumb').textContent='Your table';resetControls();window.scrollTo({top:0,behavior:'smooth'});beep(720,.15);}
   if(previous?.shot&&!m.shot){resetControls();if(m.turn===m.you)beep(600,.1);}
   if(previous&&!previous.shot&&m.shot)beep(190,.06);
   if(previous&&previous.coins.length>m.coins.length)beep(850,.07);
   renderGameUI();
  }
  if(m.type==='result'){lastGame=m;game=null;queued=null;resultModal(m);beep(m.winner===m.you?900:260,.2);}
 };
}
async function boot(){try{const res=await fetch('/api/me',{headers:sessionToken?{Authorization:'Bearer '+sessionToken}:{}});if(!res.ok)throw new Error();const p=await res.json();sessionToken=p.sessionToken;try{localStorage.setItem('carrom-session',sessionToken);}catch{}updateProfile(p);connect();}catch{toast('Could not connect. Retrying…');setTimeout(boot,2500);}}
function findMatch(){if(!profile)return toast('Your profile is still connecting.');if(game)return toast('Finish your current match first.');if(profile.balance<selected)return wallet();send({type:'join',stake:selected});}
$('findBtn').onclick=findMatch;
$('heroPlay').onclick=()=>{$('entrySection').scrollIntoView({behavior:'smooth',block:'center'});$('tierGrid').querySelector('.selected').focus({preventScroll:true});};
$('navPlay').onclick=()=>{if(game)return toast('Your match is in progress. Use Leave match to forfeit.');goLobby();};
function goLobby(){game=null;$('lobby').classList.remove('hidden');$('gameView').classList.add('hidden');$('crumb').textContent='Playroom';}
function queueModal(){
 if(!queued)return;
 setModal(`<div class="queue-view"><div class="search-animation">${icon('users')}</div><div class="modal-kicker">FINDING YOUR NEXT RIVAL</div><h2 id="modalTitle">A good game takes two.</h2><p class="modal-sub">Searching for a different player<br>at exactly the same entry tier.</p><div class="queue-tier"><b>₹${queued.stake} entry</b><span>·</span><b>₹${queued.stake*2} demo prize</b></div><div class="queue-time" id="queueTime">00:00</div><div class="queue-tip"><strong>Bring a friend to the board.</strong>Share this link. Your friend needs to open it on another device or in a private browser window, choose the same tier, and tap Find a match. There are no bot opponents.</div><button class="secondary" id="inviteBtn">${icon('copy')}Copy invite link</button><button class="cancel-search" id="cancelBtn">Cancel search</button><p class="modal-footnote">Credits are deducted only when a match starts.</p></div>`,'queue');
 $('inviteBtn').onclick=copyInvite;$('cancelBtn').onclick=closeModal;
}
async function copyInvite(){const url=new URL(location.href);url.search='';url.searchParams.set('tier',queued?.stake||selected);try{await navigator.clipboard.writeText(url.href);$('inviteBtn').innerHTML='✓ Invite link copied';}catch{if(!$('inviteLink')){$('inviteBtn').insertAdjacentHTML('afterend',`<input class="invite-link" id="inviteLink" readonly aria-label="Invite link" value="${esc(url.href)}">`);}$('inviteLink').select();toast('Copy the selected invite link and send it to a friend.');}}
function editProfile(){if(game||queued)return toast('You can change your name after your match or search.');setModal(`<div class="modal-icon">${icon('edit')}</div><div class="modal-kicker">MAKE YOURSELF AT HOME</div><h2 id="modalTitle">What should we call you?</h2><p class="modal-sub">Pick the name your opponent sees at the table.</p><form id="nameForm"><label class="input-label" for="nameInput">Display name</label><input class="text-input" id="nameInput" maxlength="20" minlength="2" required autocomplete="nickname" value="${esc(profile?.name||'')}"><button class="primary" type="submit">Save my name ${icon('arrow')}</button></form><p class="modal-footnote">Your demo profile stays in this browser.<br>This is not a verified real-money account.</p>`,'profile');$('nameForm').onsubmit=e=>{e.preventDefault();const name=$('nameInput').value.trim();if(name.length<2)return toast('Please enter at least 2 characters.');if(send({type:'name',name}))hideModal();};}
$('editProfile').onclick=editProfile;$('profileBtn').onclick=editProfile;
function wallet(){if(!profile)return;setModal(`<div class="modal-kicker">YOUR PRACTICE BANKROLL</div><h2 id="modalTitle">My demo wallet.</h2><p class="modal-sub">A little balance. A lot of possibilities.</p><div class="wallet-total"><span>Available demo credits</span><strong>${profile.balance.toFixed(2)}</strong><small>Not money. Not redeemable. Just for play.</small></div><button class="secondary" id="refillBtn">+ Refill to 250 free credits</button><h3 class="wallet-heading">Recent activity</h3><div class="ledger">${profile.history.map(h=>`<div class="ledger-row"><div><strong>${esc(h.kind)}</strong><small>${esc(h.note)} · ${new Date(h.at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></div><b class="${h.amount<0?'negative':''}">${h.amount>0?'+':''}${h.amount}</b></div>`).join('')}</div><p class="modal-footnote">Real-money deposits, withdrawals and paid play are unavailable. This is a free-to-play prototype with non-redeemable credits, not a cash gaming service.</p>`,'wallet');$('refillBtn').onclick=()=>send({type:'refill'});}
$('navWallet').onclick=wallet;$('walletChip').onclick=wallet;
function rules(){setModal(`<div class="modal-icon">${icon('book')}</div><div class="modal-kicker">QUICK CARROM · 1 VS 1</div><h2 id="modalTitle">The game, in a minute.</h2><p class="modal-sub">A quick-play house rules version of carrom,<br>not tournament rules. First to 5 points wins.</p><ol class="rules-list"><li><div><strong>Same entry. A different player.</strong>Choose ₹2, ₹5, ₹10 or ₹25 as a simulated entry. We match only different browser profiles at the same tier. The first turn is random.</div></li><li><div><strong>Line it up. Let it fly.</strong>Move the striker along your baseline. Drag back from the striker to aim and release to shoot, or use the angle and power controls. You have 45 seconds per turn.</div></li><li><div><strong>Every pocket counts.</strong>Either colour is worth 1 point. The red queen is worth 2, with no cover required. Pocket a coin and shoot again. Miss and the turn passes.</div></li><li><div><strong>Keep the striker on the board.</strong>Pocketing the striker loses 1 point, down to a minimum of 0. Coins pocketed during that shot return to the board, and the turn passes.</div></li><li><div><strong>Take the win.</strong>First to 5 wins the entire demo pool. Leaving forfeits the game; disconnecting gives you 60 seconds to return. There is no platform fee.</div></li></ol><button class="primary" id="gotRules">Got it. Let’s play. ${icon('arrow')}</button><p class="modal-footnote">All credits are simulated. No cash value or payouts.</p>`,'rules');$('gotRules').onclick=hideModal;}
$('navRules').onclick=rules;$('learnBtn').onclick=rules;$('gameRules').onclick=rules;
$('soundBtn').onclick=()=>{sound=!sound;$('soundBtn').classList.toggle('on',sound);$('soundBtn').querySelector('span').textContent=sound?'Sound on':'Sound off';if(sound)beep(550,.1);};
function resetControls(){$('positionInput').value=400;$('angleInput').value=0;$('powerInput').value=55;updateOutputs();}
function updateOutputs(){$('angleOutput').textContent=$('angleInput').value+'°';$('powerOutput').textContent=$('powerInput').value+'%';}
for(const id of ['positionInput','angleInput','powerInput'])$(id).oninput=updateOutputs;
function canShoot(){return !!(game&&connected&&game.turn===game.you&&!game.shot);}
function localPoint(p){if(!p)return null;return game?.you===1?{...p,x:800-p.x,y:800-p.y}:{...p};}
function currentStriker(){if(!game)return null;const p=localPoint(game.striker);if(canShoot()&&p){p.x=+$('positionInput').value;p.y=626;}return p;}
function shoot(dx,dy,power){if(!canShoot())return;const x=+$('positionInput').value,flip=game.you===1;send({type:'shoot',x:flip?800-x:x,dx:flip?-dx:dx,dy:flip?-dy:dy,power});}
$('shootBtn').onclick=()=>{const a=+$('angleInput').value*Math.PI/180;shoot(Math.sin(a),-Math.cos(a),+$('powerInput').value/100);};
function renderGameUI(){
 if(!game)return;const g=game;const mine=g.turn===g.you;
 $('tableCode').textContent='#'+g.id.slice(0,6).toUpperCase();
 const me=g.players[g.you],op=g.players[1-g.you];
 $('scoreboard').innerHTML=`<div class="score-player ${mine?'active':''}"><div class="avatar">${esc(me.name[0].toUpperCase())}</div><strong>${esc(me.name)}</strong><small>YOU</small></div><div class="score-mid">${g.scores[g.you]}<span>:</span>${g.scores[1-g.you]}</div><div class="score-player ${!mine?'active':''}"><div class="avatar">${esc(op.name[0].toUpperCase())}</div><strong>${esc(op.name)}</strong><small>${op.online?'OPPONENT':'RECONNECTING'}</small></div>`;
 $('turnLabel').textContent=g.shot?'Shot in motion':mine?'Your turn':'Opponent’s turn';$('gameMessage').textContent=g.last;$('gamePrize').textContent='₹'+g.stake*2;
 for(const id of ['positionInput','angleInput','powerInput','shootBtn'])$(id).disabled=!canShoot();
 $('shootBtn').innerHTML=(g.shot?'Watch it roll':mine?'Take the shot':'Waiting for opponent')+icon('arrow');
}
$('leaveBtn').onclick=()=>{setModal(`<div class="modal-icon">${icon('arrow')}</div><h2 id="modalTitle">Leaving already?</h2><p class="modal-sub">Leaving forfeits the match. Your opponent receives the demo prize pool and your entry credits won’t be returned.</p><button class="primary" id="stayBtn">Stay at the table</button><button class="secondary" id="forfeitBtn">Leave and forfeit</button>`,'leave');$('stayBtn').onclick=hideModal;$('forfeitBtn').onclick=()=>{send({type:'forfeit'});hideModal();};};
function resultModal(r){const won=r.you===r.winner;setModal(`<div class="result-view"><div class="result-icon">${icon(won?'trophy':'target')}</div><div class="modal-kicker">${won?'THAT’S HOW IT’S DONE':'ANOTHER TABLE. ANOTHER CHANCE.'}</div><h2 id="modalTitle">${won?'The board is yours.':'Good game. Go again?'}</h2><p class="modal-sub">${won?'Nicely played, '+esc(r.players[r.you])+'.':esc(r.players[r.winner])+' takes this one.'}<br>${esc(r.reason)}.</p><div class="result-score">${r.scores[r.you]} : ${r.scores[1-r.you]}</div><div class="result-prize">${won?'Demo prize credited to your wallet':'Your simulated entry'}<strong>${won?'+':'−'}${won?r.prize:r.stake} credits</strong></div><button class="primary" id="playAgain">Find another match ${icon('arrow')}</button><button class="secondary" id="backLobby">Back to the playroom</button><p class="modal-footnote">Demo credits only. No real-money winnings.</p></div>`,'result');$('playAgain').onclick=()=>{selected=r.stake;goLobby();hideModal();renderTiers();findMatch();};$('backLobby').onclick=()=>{goLobby();hideModal();};}
function pointerCoords(e){const r=$('gameBoard').getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*800,y:(e.clientY-r.top)/r.height*800};}
$('gameBoard').addEventListener('pointerdown',e=>{if(!canShoot())return;const p=pointerCoords(e),s=currentStriker();if(Math.hypot(p.x-s.x,p.y-s.y)<45){drag={start:{x:s.x,y:s.y},end:p};$('gameBoard').setPointerCapture(e.pointerId);e.preventDefault();}else if(Math.abs(p.y-626)<32&&p.x>=196&&p.x<=604){$('positionInput').value=p.x;}});
$('gameBoard').addEventListener('pointermove',e=>{if(!drag)return;drag.end=pointerCoords(e);const dx=drag.start.x-drag.end.x,dy=drag.start.y-drag.end.y;const angle=Math.atan2(dx,-dy)*180/Math.PI;$('angleInput').value=Math.round(angle);$('powerInput').value=Math.round(Math.min(100,Math.hypot(dx,dy)/1.8));updateOutputs();});
$('gameBoard').addEventListener('pointerup',e=>{if(!drag)return;const p=pointerCoords(e),dx=drag.start.x-p.x,dy=drag.start.y-p.y;drag=null;if(Math.hypot(dx,dy)>10)shoot(dx,dy,Math.min(1,Math.hypot(dx,dy)/180));});
$('gameBoard').addEventListener('pointercancel',()=>drag=null);
setInterval(()=>{if(queued&&$('queueTime')){const sec=Math.floor((Date.now()-queued.since)/1000);$('queueTime').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}if(game){const left=Math.max(0,Math.ceil((game.deadline-Date.now())/1000));$('turnTime').textContent=game.shot?'…':left+'s';$('timeFill').style.width=(game.shot?100:left/45*100)+'%';}},250);
// Canvas art and live board rendering share exactly the same geometry as the server.
function roundRect(ctx,x,y,w,h,r,fill,stroke,width=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function circle(ctx,x,y,r,fill,stroke,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
const boardBase=document.createElement('canvas');boardBase.width=800;boardBase.height=800;
function paintBase(){const c=boardBase.getContext('2d');const wood=c.createLinearGradient(0,0,800,800);wood.addColorStop(0,'#c09a70');wood.addColorStop(.4,'#a77950');wood.addColorStop(.7,'#b48b62');wood.addColorStop(1,'#98704c');roundRect(c,0,0,800,800,23,wood);roundRect(c,8,8,784,784,18,null,'#dec09c',2);roundRect(c,18,18,764,764,13,null,'#735138',1.5);
 for(let i=0;i<28;i++){c.strokeStyle=`rgba(78,49,26,${.025+(i%3)*.012})`;c.lineWidth=1;c.beginPath();const z=22+i*1.1;c.moveTo(z,z);c.lineTo(800-z,z+Math.sin(i)*2);c.lineTo(800-z,800-z);c.stroke();}
 roundRect(c,44,44,712,712,9,'#513d2e');roundRect(c,55,55,690,690,6,'#d2ad78');const field=c.createLinearGradient(60,60,740,740);field.addColorStop(0,'#f4e1bd');field.addColorStop(.5,'#f5e1bb');field.addColorStop(1,'#ecd4a7');roundRect(c,66,66,668,668,3,field,'#5c4934',3);
 c.save();c.beginPath();c.rect(70,70,660,660);c.clip();for(let i=0;i<200;i++){const y=71+i*3.3;c.strokeStyle=i%3===0?'#bc925308':'#ffffff13';c.lineWidth=i%5===0?1.5:.6;c.beginPath();c.moveTo(70,y);c.bezierCurveTo(230,y+2,590,y-2,733,y+1);c.stroke();}c.restore();
 for(const [x,y] of [[27,27],[773,27],[27,773],[773,773]]){circle(c,x,y,4,'#66503b','#d3b48f',1);c.strokeStyle='#a08769';c.beginPath();c.moveTo(x-2,y+2);c.lineTo(x+2,y-2);c.stroke();}
 const burgundy='#9a4241';
 for(let side=0;side<4;side++){c.save();c.translate(400,400);c.rotate(side*Math.PI/2);c.translate(-400,-400);c.lineWidth=2;c.strokeStyle='#695444';c.beginPath();c.moveTo(195,605);c.lineTo(605,605);c.moveTo(195,647);c.lineTo(605,647);c.stroke();roundRect(c,175,605,450,42,21,null,'#66513f',2);for(const x of [196,604]){circle(c,x,626,20.5,null,'#594735',1.8);circle(c,x,626,12.5,burgundy);circle(c,x,626,9.5,null,'#bd7d60',.7);}c.restore();}
 circle(c,400,400,75,null,'#976c53',1.2);circle(c,400,400,68,null,'#b48c63',.7);circle(c,400,400,27,null,burgundy,1.6);circle(c,400,400,21,'#b7685355',burgundy,1);
 for(let i=0;i<8;i++){c.save();c.translate(400,400);c.rotate(i*Math.PI/4);c.strokeStyle='#9e6552';c.lineWidth=1;c.beginPath();c.moveTo(0,28);c.quadraticCurveTo(12,48,0,65);c.quadraticCurveTo(-12,48,0,28);c.stroke();c.restore();}
 for(let i=0;i<4;i++){c.save();c.translate(400,400);c.rotate(i*Math.PI/2);c.translate(-400,-400);c.strokeStyle='#97745c';c.lineWidth=1.5;c.beginPath();c.moveTo(133,133);c.lineTo(273,273);c.stroke();c.beginPath();c.moveTo(264,272);c.lineTo(275,275);c.lineTo(272,264);c.stroke();c.beginPath();c.arc(262,262,18,0,Math.PI*1.7);c.stroke();c.restore();}
 for(const [x,y] of [[96,96],[704,96],[96,704],[704,704]]){circle(c,x,y,31,'#967048','#c9a477',2);circle(c,x,y,26.5,'#28231f','#624b35',2);const hole=c.createRadialGradient(x-3,y-2,1,x,y,25);hole.addColorStop(0,'#171718');hole.addColorStop(1,'#342c25');circle(c,x,y,24,hole);c.strokeStyle='#ffffff08';c.lineWidth=1;for(let j=-15;j<=15;j+=8){c.beginPath();c.moveTo(x-15,y+j);c.lineTo(x+15,y+j);c.stroke();}}
 c.fillStyle='#8e7252';c.font='500 10px Arial';c.textAlign='center';c.fillText('C A R R O M   C L U B',400,104);c.font='8px Arial';c.fillStyle='#b4966c';c.fillText('M A D E   F O R   T H E   G A M E',400,707);
}
function paintCoin(c,p){const r=p.r||14;const isWhite=p.kind==='white',isQueen=p.kind==='queen',isStriker=p.kind==='striker';c.save();c.shadowColor='#2f201f40';c.shadowBlur=isStriker?5:3;c.shadowOffsetY=isStriker?3:2;let fill=isWhite?'#f6e9cf':isQueen?'#ac4a59':isStriker?'#fff8e9':'#32303a';let rim=isWhite?'#baa784':isQueen?'#853544':isStriker?'#a877a5':'#1c1c24';circle(c,p.x,p.y,r,fill,rim,isStriker?1.7:1.2);c.shadowColor='transparent';circle(c,p.x,p.y,r-3,null,isWhite?'#d8c7a3':isQueen?'#cd7c82':isStriker?'#a4759d':'#55515b',1);circle(c,p.x,p.y,r-5.5,null,isWhite?'#ebdec4':isQueen?'#be606c':isStriker?'#caaaad':'#3f3b45',.7);if(isStriker){circle(c,p.x,p.y,5.3,'#9e6b9d');for(let i=0;i<8;i++){const a=i*Math.PI/4;circle(c,p.x+Math.cos(a)*10,p.y+Math.sin(a)*10,1.5,'#b18ca8');}}else if(isQueen){circle(c,p.x,p.y,2,'#d99395');}c.restore();}
paintBase();
const heroCoins=[];for(let q=-2;q<=2;q++)for(let r=-2;r<=2;r++)if(Math.abs(q+r)<=2){const n=heroCoins.length;heroCoins.push({x:400+q*30+r*15,y:400+r*26,kind:q===0&&r===0?'queen':n%2?'white':'black',r:14});}
heroCoins[1]={x:272,y:289,kind:'white',r:14};heroCoins[5]={x:559,y:473,kind:'black',r:14};heroCoins[15]={x:348,y:534,kind:'white',r:14};
const hc=$('heroBoard').getContext('2d');hc.drawImage(boardBase,0,0);heroCoins.forEach(p=>paintCoin(hc,p));paintCoin(hc,{x:420,y:626,kind:'striker',r:19});
const gc=$('gameBoard').getContext('2d');
function drawGame(time){requestAnimationFrame(drawGame);if(!game||time-rafTime<24)return;rafTime=time;gc.clearRect(0,0,800,800);gc.drawImage(boardBase,0,0);game.coins.forEach(p=>paintCoin(gc,localPoint(p)));const s=currentStriker();if(s)paintCoin(gc,s);
 if(canShoot()&&s){const angle=+$('angleInput').value*Math.PI/180;const dx=Math.sin(angle),dy=-Math.cos(angle),power=+$('powerInput').value/100;const length=80+130*power;gc.save();gc.setLineDash([5,9]);gc.strokeStyle='#81538bb0';gc.lineWidth=2;gc.beginPath();gc.moveTo(s.x+dx*27,s.y+dy*27);gc.lineTo(s.x+dx*length,s.y+dy*length);gc.stroke();gc.setLineDash([]);const ex=s.x+dx*length,ey=s.y+dy*length;gc.beginPath();gc.moveTo(ex-dx*12+dy*6,ey-dy*12-dx*6);gc.lineTo(ex,ey);gc.lineTo(ex-dx*12-dy*6,ey-dy*12+dx*6);gc.stroke();circle(gc,s.x,s.y,28,null,'#ad88b370',1.5);
 if(drag){gc.strokeStyle='#87528f66';gc.lineWidth=6;gc.lineCap='round';gc.beginPath();gc.moveTo(s.x,s.y);gc.lineTo(drag.end.x,drag.end.y);gc.stroke();circle(gc,drag.end.x,drag.end.y,5,'#8e6695');}gc.restore();}
}
requestAnimationFrame(drawGame);renderTiers();$('findBtn').disabled=true;boot();
