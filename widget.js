(function(){
var WEBHOOK='https://digitalharmony.app.n8n.cloud/webhook/Vapers-one-chat';
var sessionId='vap-'+Math.random().toString(36).substring(2);
var isLoading=false,msgCount=0;

var fl=document.createElement('link');
fl.rel='stylesheet';
fl.href='https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=DM+Sans:wght@400;500&display=swap';
document.head.appendChild(fl);

var btn=document.createElement('button');
btn.id='vapy-btn';
btn.setAttribute('aria-label','Chat cu Vapy');
btn.innerHTML='<div id="vapy-notif"></div><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><\/svg>';
document.body.appendChild(btn);

var chat=document.createElement('div');
chat.id='vapy-chat';
chat.innerHTML='<div class="vap-header"><div class="vap-avatar">&#128168;<\/div><div style="flex:1"><div class="vap-name">Vapy &middot; Asistent Vapers-One<\/div><div class="vap-status">&#9679; Online acum<\/div><\/div><\/div>'
+'<div id="vapy-messages"><div class="vap-wrap is-bot"><div class="vap-msg vap-bot">Salut! Sunt Vapy &#128075;<br>Asistentul tau pentru tigari electronice, lichide si accesorii.<\/div><\/div><\/div>'
+'<div class="vap-qrs" id="vapy-iqr"><\/div>'
+'<div class="vap-bottom"><input id="vapy-input" type="text" placeholder="Scrie un mesaj..."><button id="vapy-send"><svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke-width="2" stroke-linecap="round"\/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-width="2" stroke-linejoin="round"\/><\/svg><\/button><\/div>';
document.body.appendChild(chat);

var iqr=document.getElementById('vapy-iqr');
['Produse disponibile','Preturi si oferte','Livrare','Contact'].forEach(function(t){
  var b=document.createElement('button');
  b.className='vap-qr';b.textContent=t;
  b.addEventListener('click',function(){sendMessage(t);});
  iqr.appendChild(b);
});

var msgs=document.getElementById('vapy-messages');
var input=document.getElementById('vapy-input');
var sendBtn=document.getElementById('vapy-send');
var notif=document.getElementById('vapy-notif');

setTimeout(function(){if(!chat.classList.contains('open'))notif.style.display='block';},4000);

btn.addEventListener('click',function(){
  chat.classList.toggle('open');
  notif.style.display='none';
  if(chat.classList.contains('open'))setTimeout(function(){input.focus();},300);
});

function getTime(){var d=new Date(),h=d.getHours(),m=d.getMinutes();return(h<10?'0':'')+h+':'+(m<10?'0':'')+m;}

function addMessage(type,text){
  iqr.style.display='none';
  var wrap=document.createElement('div');
  wrap.className='vap-wrap '+(type==='user'?'is-user':'is-bot');
  var div=document.createElement('div');
  div.className='vap-msg '+(type==='user'?'vap-user':'vap-bot');
  div.innerHTML=text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1<\/strong>');
  var time=document.createElement('div');
  time.className='vap-time';time.textContent=getTime();
  wrap.appendChild(div);wrap.appendChild(time);
  msgs.appendChild(wrap);scrollBottom();
  return wrap;
}

function addFeedback(wrap){
  var mid='vm'+(++msgCount);
  var fb=document.createElement('div');
  fb.className='vap-feedback';
  var lbl=document.createElement('span');lbl.className='vap-fblabel';lbl.textContent='Util?';
  var lk=document.createElement('button');lk.className='vap-fbtn';lk.id='lk-'+mid;lk.innerHTML='&#128077;';
  var dk=document.createElement('button');dk.className='vap-fbtn';dk.id='dk-'+mid;dk.innerHTML='&#128078;';
  (function(m){
    lk.addEventListener('click',function(){document.getElementById('lk-'+m).classList.add('liked');document.getElementById('dk-'+m).classList.add('done');doFeedback(m,'like');});
    dk.addEventListener('click',function(){document.getElementById('dk-'+m).classList.add('disliked');document.getElementById('lk-'+m).classList.add('done');doFeedback(m,'dislike');});
  })(mid);
  fb.appendChild(lbl);fb.appendChild(lk);fb.appendChild(dk);
  wrap.appendChild(fb);
}

function doFeedback(mid,type){
  fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({feedback:true,feedbackType:type,messageId:mid,sessionId:sessionId,timestamp:new Date().toISOString()})
  }).catch(function(){});
}

function addQRs(list){
  var old=document.getElementById('vapy-dqr');
  if(old&&old.parentNode)old.parentNode.removeChild(old);
  var c=document.createElement('div');c.className='vap-qrs';c.id='vapy-dqr';
  list.forEach(function(r){
    var b=document.createElement('button');b.className='vap-qr';b.textContent=r;
    b.addEventListener('click',function(){if(c.parentNode)c.parentNode.removeChild(c);sendMessage(r);});
    c.appendChild(b);
  });
  document.querySelector('.vap-bottom').before(c);
}

function addTyping(){
  var wrap=document.createElement('div');wrap.className='vap-wrap is-bot';
  var div=document.createElement('div');div.className='vap-msg vap-bot';
  var t=document.createElement('div');t.className='vap-typing';
  for(var i=0;i<3;i++){var d=document.createElement('div');d.className='vap-dot';t.appendChild(d);}
  div.appendChild(t);wrap.appendChild(div);msgs.appendChild(wrap);scrollBottom();
  return wrap;
}

function scrollBottom(){msgs.scrollTop=msgs.scrollHeight;}

function sendMessage(text){
  if(!text||!text.trim()||isLoading)return;
  var dqr=document.getElementById('vapy-dqr');
  if(dqr&&dqr.parentNode)dqr.parentNode.removeChild(dqr);
  addMessage('user',text.trim());input.value='';
  var typing=addTyping();isLoading=true;sendBtn.disabled=true;
  fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text.trim(),sessionId:sessionId})})
  .then(function(r){if(!r.ok)throw new Error('');return r.json();})
  .then(function(data){
    if(typing.parentNode)typing.parentNode.removeChild(typing);
    var reply=data.reply||data.message||'Momentan nu pot raspunde.';
    var wrap=addMessage('bot',reply);addFeedback(wrap);
    if(data.quickReplies&&data.quickReplies.length)addQRs(data.quickReplies);
  })
  .catch(function(){
    if(typing.parentNode)typing.parentNode.removeChild(typing);
    addMessage('bot','Conexiune indisponibila. Incearca din nou.');
  })
  .then(function(){isLoading=false;sendBtn.disabled=false;input.focus();});
}

sendBtn.addEventListener('click',function(){sendMessage(input.value);});
input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();sendMessage(input.value);}});
})();
