const chatForm = document.getElementById('chat-form');
const chatMessages= document.querySelector('.chat-messages');

const roomName= document.getElementById('room-name');
const userList= document.getElementById('users');
const socket = io();

// GET USERNAME AND ROOM FROM URL
 const {username, room} = Qs.parse(location.search, {
   ignoreQueryPrefix: true
 });
//qs cdn library to grab username and room from address bar

//JOIN CHATROOM

socket.emit('joinRoom', {username, room});

//GET ROOM AND USERS

socket.on('roomUsers', ({room, users}) =>{
  outputRoomName(room);
  outputUsers(users);
} );

// MESSAGE FROM THE SERVER
socket.on('message', message => {
  console.log(message);

  outputMessage(message);


  // SCROLL DOWN WHEN SENDING MESSAGE
  chatMessages.scrollTop= chatMessages.scrollHeight;

});

// MESSAGE SUBMIT

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();  // to prevent the default action on clicking submit
  
  //Get message text
  const msg = e.target.elements.msg.value;

  // Emitting a message to the server
  socket.emit('chatMessage',msg);

  // CLEARING MESSAGE FROM CHATBOX AFTER EMITTING 
  e.target.elements.msg.value="";
  e.target.elements.msg.focus();


});


// OUTPUT MESSAGE TO DOM

function outputMessage(message){
  const div= document.createElement('div');
  div.classList.add('message'); // classList gives all the classes and we are adding a message class to it
  div.innerHTML= `<p class = "meta"> ${message.username} <span> ${message.time}</span></p>
  <p class= "text">
    ${message.text}
  </p> `;
  document.querySelector('.chat-messages').appendChild(div);
}


// ADD ROOM NAME TO DOM

function outputRoomName(room){
  roomName.innerText = room;
}


//ADD USERS TO DOM

function outputUsers(users){
  userList.innerHTML = `
  ${users.map(user=> `<li> ${user.username}</li>`).join('')}
  `;
}