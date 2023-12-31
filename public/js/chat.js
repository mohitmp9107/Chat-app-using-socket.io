const socket = io()

//DOM Elements

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = ()=>{
    // new msg element
    const $newMessage = $messages.lastElementChild;

    //Height of new msg
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    
    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message',(msg)=>{
    console.log(msg);
    //render the templates
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        msg:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
}) 

socket.on('locationMessage',(msg)=>{
    console.log(msg);
    //render the templates
    const html = Mustache.render(locationMessageTemplate,{
        username:msg.username,
        url:msg.url,
        createdAt:moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
}) 

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled');

    const msg = e.target.elements.message.value;
    socket.emit('sendMessage',msg,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
        }
        console.log('Message delievered!');
    });
})

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(acknowledgement)=>{
            console.log(acknowledgement);
            $sendLocationButton.removeAttribute('disabled');
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});