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

socket.on('message',(msg)=>{
    console.log(msg);
    //render the templates
    const html = Mustache.render(messageTemplate,{
        msg
    });
    $messages.insertAdjacentHTML('beforeend',html);
}) 

socket.on('locationMessage',(url)=>{
    console.log(url);
    //render the templates
    const html = Mustache.render(locationMessageTemplate,{
        url
    });
    $messages.insertAdjacentHTML('beforeend',html);
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