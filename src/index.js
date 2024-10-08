const express=require('express')
const socketio=require('socket.io')
const http=require('http')
const path=require('path')
const Filter=require('bad-words')
const app=express()

 const {generateMessage,generateLocationMessage}=require('./utils/messages')
 const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const server=http.createServer(app)

const io=socketio(server)

const port=process.env.PORT || 3000

const publicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))


let count=0
io.on('connection',(socket)=>{   //connection and disconnect are built in events
    console.log('New WebSocket Connection')

    socket.on('join',({username,room},callback)=>{

        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
           return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome!'))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    callback()
       
    //socket.emit(to particular person that has joined),io.emit(to every one),socket.broadcast.emit(except the person using it)
    //socket.broadcast.to().emit  ,  io.to.emit
    })

    

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
       const filter=new Filter()
       if(filter.isProfane(message)){
           return callback('Profanity is not allowed')
       }

       io.to(user.room).emit('message',generateMessage(user.username,message))   
       callback()
    })

       socket.on('sendLocation',(location,callback)=>{
           const user=getUser(socket.id)
       io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
       callback()
     })

   socket.on('disconnect',()=>{

    const user=removeUser(socket.id)
    if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`)) 
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
      
   })
})

server.listen(port,()=>{
    console.log(`server is up on ${port}!`)
}) 