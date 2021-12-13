const path = require('path');
const http= require('http');
const express = require('express');
const socketio= require('socket.io');
const formatMessage = require('./utils/messages');
const { format } = require('path');
const {userJoin, getCurrentUser, userLeave, getRoomUsers}= require('./utils/users');

const app= express();
const server = http.createServer(app);
const io= socketio(server);

//SETTING STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));
const botName= 'ChatSystem Bot'
//RUNS WHEN A CLIENT CONNECTS
io.on('connection', socket => {                          //'on' listens to some event occuring, here the event is connection
   
    socket.on('joinRoom', ({username, room}) => {
        const user= userJoin(socket.id, username, room);
        socket.join(user.room);


        //.emit emits to the user that connects [io.emit() emits to everyone]
        socket.emit('message', formatMessage(botName, 'WELCOME TO CHATSEARCH!'));    // emits message as soon as the server is established

        // BROADCASTED WHEN A USER EMITS
        // broadcast.emit emits to everyone except the user who connects

        socket.broadcast
        .to(user.room)
        .emit('message', formatMessage(botName,` ${user.username} has joined the chat!`));

        // SEND USERS AND ROOM INFO
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    

    //LISTEN FOR chatMessage

    socket.on('chatMessage', (msg) => {

        const user= getCurrentUser(socket.id);
       // console.log(msg);  // to log it here in the server console

        io.to(user.room)
        .emit('message', formatMessage(user.username,msg)); // to send it back to the client as a message
    });

     // RUNS WHEN CLIENT DISCONNECTS
     socket.on('disconnect', ()=> {
        const user= userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));
            
            // SEND USERS AND ROOM INFO
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        
        }
    });

});


const PORT= 3000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});
