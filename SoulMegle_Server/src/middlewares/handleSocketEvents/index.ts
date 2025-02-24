import {SocketIoInstance as io} from '../../index'
import { addUserSocketId,removeUserSocketId, getUserSocketId } from '../../services/redisService'
import {addToMatchMakingQueue} from '../../services/redisQueue'
import {addUserEmbedding, removeUserEmbedding} from '../../services/redisService'
import {Request} from 'express'

const handleSocketEvents=async()=>{
        try{
io.on('connection', async (socket) => {
  try{
  const req = socket.request as Request;
  const userId = req.session?.passport?.user as string
  await addUserSocketId(userId,socket.id)
  console.log('User connected', socket.id)

  // Access the session data
  //console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);

  socket.on('start-matchmaking',async()=>{
          try{
    const req = socket.request as Request;
    const userId = req.session?.passport?.user as string
    await addUserEmbedding(userId)
    await addToMatchMakingQueue(userId)
          }catch(err){console.log(err)}
  })

  socket.on('listner-ready',async(data)=>{
    const targetId=data.targetId;
    io.to(targetId).emit('start-webrtc-source',{targetId:socket.id});
  })

  socket.on('next-matchmaking',async()=>{
    // find a way to get target user ID
          try{
    const req=socket.request as Request
    const userId=req.session?.passport?.user as string
    await addToMatchMakingQueue(userId)
          }catch(err){console.log(err)}
  })

  socket.on('end-call',(data)=>{
    const targetId=data.targetId;
    io.to(targetId).emit('end-webrtc',{targetId: socket.id});
  })

  socket.on('disconnect', async () => {
          try{
    console.log('User disconnected:', socket.id);
    const req = socket.request as Request;
    const userId = req.session?.passport?.user as string
    await removeUserSocketId(userId)
    await removeUserEmbedding(userId)
          }catch(err){console.log(err)}
  });

  socket.on('signal',async(data)=>{
    io.to(data.targetId).emit('signal',data)
  })


}catch(err){
  console.log(err)
}
});
        }catch(err){console.log(err)}
}
export default handleSocketEvents;