const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {genereateMessage,genereateLocationMessage} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server); 

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{
    console.log('New websocket connection');
    socket.on('join',(options,callback)=>{
        const {error,user} = addUser({id:socket.id,...options});

        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message',genereateMessage('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit('message',genereateMessage('Admin',`${user.username} has joined`));
        
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback(); // with no error message
    })

    socket.on('sendMessage',(msg,callback)=>{
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('profanity is not allowed!');
        }
        io.to(user.room).emit('message',genereateMessage(user.username,msg)); // emit sends to everybody
        callback();
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id);
        setTimeout(()=>{
            io.to(user.room).emit('locationMessage',genereateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
            callback(); 
        },2000)
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',genereateMessage('Admin',`${user.username} has left!!`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})
server.listen(port,()=>{
    console.log('listening on port :',port);
})



//websocket allow for full duplex communication
//websockt is a seperate protocol from HTTp
//persistent connection bw client & server