//module
const socket = io();

//getting ID's from html
const chatMsg = document.getElementById("chat-msg");
const chatMessages = document.querySelector('chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users'); 

//get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//join chatroom
socket.emit('joinRoom', {username,room});

//get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//message from server, runs function to output message to DOM
socket.on("message", (message) => {
//   console.log(message)
  outputMessage(message);

  //scroll down 
//   chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatMsg.addEventListener("submit", (e) => {
  e.preventDefault();

  //getting the message text
  const msg = e.target.elements.msg.value;

  //emitting message to server
  socket.emit("chatMessage", msg);

  //clear input after msg is sent 
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//function to append the message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to DOM function
function outputRoomName(room){
    roomName.innerText = room;
}
//add users to DOM function
function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}