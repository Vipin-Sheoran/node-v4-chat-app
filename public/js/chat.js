const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')

const $sendLocationButton=document.querySelector('#send-location')

const $messages=document.querySelector('#messages')
//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options 
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild
//height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const  newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    //height of message container
    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(message)=>{        //here this is callback function which finds the message on index page which the server wants to send to the client

    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')    
    })
    $messages.insertAdjacentHTML('beforeend', html)       
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({ room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    // const message=document.querySelector('input').value
    const message=e.target.elements.message.value   //e.target will led to the target we set up above which is form
    socket.emit('sendMessage',message,(error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered') 
    })
}) 

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
      socket.emit('sendLocation',{
          latitude:position.coords.latitude,
          longitude:position.coords.longitude
      },()=>{
          console.log('Location Shared')
          $sendLocationButton.removeAttribute('disabled')
      }) //)
    })
})

socket.emit('join',{username,room},(error)=>{
if(error){
    alert(error)
    location.href='/'
}
})


// document.querySelector('#increment').addEventListener('send',()=>{
//     console.log('sent')
//     socket.emit('increment')
// })