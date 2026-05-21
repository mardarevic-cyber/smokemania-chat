setTimeout(function(){

var WEBHOOK_URL = 'https://digitalharmony.app.n8n.cloud/webhook/Vapers-one-chat';
var sessionId = 'vap-' + Math.random().toString(36).substring(2);

// Creeaza butonul
var toggle = document.createElement('button');
toggle.id = 'vap-toggle';
toggle.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><\/svg>';
document.body.appendChild(toggle);

// Creeaza fereastra chat
var chat = document.createElement('div');
chat.id = 'vap-chat';

var header = document.createElement('div');
header.className = 'vap-header';
header.innerHTML = '<div class="vap-avatar">&#128168;<\/div><div class="vap-info"><div class="vap-name">Vapy AI Assistant<\/div><div class="vap-status">&#9679; Online<\/div><\/div>';
chat.appendChild(header);

var messages = document.createElement('div');
messages.id = 'vap-messages';
var welcomeMsg = document.createElement('div');
welcomeMsg.className = 'vap-message vap-bot';
welcomeMsg.innerHTML = 'Salut! Sunt Vapy &#128075;<br><br>Te pot ajuta cu recomandari, lichide, arome, compatibilitate si livrare.';
messages.appendChild(welcomeMsg);
chat.appendChild(messages);

var bottom = document.createElement('div');
bottom.className = 'vap-bottom';
var input = document.createElement('input');
input.id = 'vap-input';
input.type = 'text';
input.placeholder = 'Scrie un mesaj...';
var sendBtn = document.createElement('button');
sendBtn.id = 'vap-send';
sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke-width="2" stroke-linecap="round"\/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-width="2" stroke-linejoin="round"\/><\/svg>';
bottom.appendChild(input);
bottom.appendChild(sendBtn);
chat.appendChild(bottom);

document.body.appendChild(chat);

// Toggle
toggle.addEventListener('click', function(){
  chat.classList.toggle('open');
});

// Adauga mesaj
function addMessage(type, text){
  var div = document.createElement('div');
  div.classList.add('vap-message');
  div.classList.add(type === 'user' ? 'vap-user' : 'vap-bot');
  div.innerHTML = formatText(text);
  messages.appendChild(div);
  scrollBottom();
  return div;
}

// Typing indicator
function addTyping(){
  var div = document.createElement('div');
  div.classList.add('vap-message');
  div.classList.add('vap-bot');
  var typing = document.createElement('div');
  typing.className = 'vap-typing';
  for(var i = 0; i < 3; i++){
    var dot = document.createElement('div');
    dot.className = 'vap-dot';
    typing.appendChild(dot);
  }
  div.appendChild(typing);
  messages.appendChild(div);
  scrollBottom();
  return div;
}

// Trimite mesaj
function sendMessage(){
  var text = input.value.trim();
  if(!text) return;
  addMessage('user', text);
  input.value = '';
  var typing = addTyping();
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, sessionId: sessionId })
  })
  .then(function(response){
    if(!response.ok) throw new Error('Server Error: ' + response.status);
    return response.json();
  })
  .then(function(data){
    if(typing.parentNode) typing.parentNode.removeChild(typing);
    var reply = data.reply || data.raspunsSmoky || data.message || 'Momentan nu pot raspunde.';
    addMessage('bot', reply);
  })
  .catch(function(error){
    if(typing.parentNode) typing.parentNode.removeChild(typing);
    addMessage('bot', 'Conexiune indisponibila momentan.');
    console.error(error);
  });
}

function formatText(text){
  return text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1<\/strong>');
}

function scrollBottom(){
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', function(e){
  if(e.key === 'Enter'){ e.preventDefault(); sendMessage(); }
});

}, 1000);
