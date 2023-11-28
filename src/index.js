const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {genereateMessage,genereateLocationMessage} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server); 

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{
    console.log('New websocket connection');
    socket.emit('message',genereateMessage('Welcome!'));

    socket.broadcast.emit('message',genereateMessage('Welcome!')); //broadcast sends to everyone except self

    socket.on('sendMessage',(msg,callback)=>{
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('profanity is not allowed!');
        }
        io.emit('message',genereateMessage(msg)); // emit sends to everybody
        callback('Delievered!');
    })
    socket.on('sendLocation',(coords,callback)=>{
        setTimeout(()=>{
            io.emit('locationMessage',genereateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
            callback('Location shared!'); 
        },2000)
        // io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
        // callback('Location shared!');
    })

    socket.on('disconnect',()=>{
        io.emit('message',genereateMessage('A user has left!!'));
    })
})
server.listen(port,()=>{
    console.log('listening on port :',port);
})



//websocket allow for full duplex communication
//websockt is a seperate protocol from HTTp
//persistent connection bw client & server