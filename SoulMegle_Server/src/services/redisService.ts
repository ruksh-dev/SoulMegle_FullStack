import Redis from 'ioredis';
import pc from '../utils/vectorDb/index'
const expirySeconds=120; // time in seconds
export const redis=new Redis()

export const addUserMatch=async(userId1:string, userId2:string)=>{
try{
        await redis.sadd(userId1,userId2);
        await redis.sadd(userId2,userId1);
        await redis.expire(userId1, expirySeconds);
        await redis.expire(userId2, expirySeconds);
console.log('added user match ',userId1,', ',userId2);
}catch(err){
console.log(err);
}
}

export const removeUserMatch =async(userId: string) => {
  try{
  const matches=await redis.smembers(userId)
  if(!matches) {
  console.log('no match found to remove for user: ',userId)
  return
  }
  await redis.srem(userId,matches[0])
  console.log('match removed successfully for user: ',userId);

  }catch(err){console.log(err)}
};

export const getUserMatches=async(userId:string)=>{
  try{
    const matches=await redis.smembers(userId)
    if(!matches) throw new Error(`could not get user for user: ${userId}`)
     return matches[0];
  }catch(err){console.log(err)}
}

export const checkUserMatch=async(userId:string, matchId:string)=>{
  try{
    const result=await redis.sismember(userId,matchId);
    return result;
  }catch(err){console.log(err)}
}

export const addUserSocketId=async(userId:string,socketId:string)=>{
    try{
        console.log('User socket id added',`${userId}-`,socketId)
            await redis.hset('userSocketId',`${userId}`,socketId)
    }catch(err){
        console.log(err);
    }
}

export const getUserSocketId=async(userId:string)=>{
    try{
        const socketId=await redis.hget('userSocketId',`${userId}`)
        return socketId;
    }catch(err){
        console.log(err);
    }
}

export const removeUserSocketId=async(userId:string)=>{
    try{
        await redis.hdel('userSocketId',`${userId}`)
    }catch(err){
        console.log(err);
    }
}

export const addUserEmbedding=async(userId:any)=>{
    try{
        const UserInterestsIndex=pc.index('user-interests')
        const response = await UserInterestsIndex.fetch(userId);
        const vectorEmbedding = response.records[`${userId}`].values
        await redis.hset('userEmbedding',`${userId}`,JSON.stringify(vectorEmbedding))
         console.log('User embedding added',`${userId}-`,vectorEmbedding)
    }catch(err){
        console.log(err);
    }
}

export const removeUserEmbedding=async(userId:string)=>{
    try{
        await redis.hdel('userEmbedding',`${userId}`)
    }catch(err){
        console.log(err);
    }
}

export const getAllUserEmbedding=async()=>{
    try{
        const userEmbeddings=await redis.hgetall('userEmbedding')
        return userEmbeddings;
    }catch(err){
        console.log(err);
    }
}