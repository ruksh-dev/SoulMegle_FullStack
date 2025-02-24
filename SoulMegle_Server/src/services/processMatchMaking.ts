import {checkUserMatch,getUserMatches,getAllUserEmbedding,getUserSocketId} from './redisService'
import {SocketIoInstance} from '../index'
import * as math from 'mathjs'
const threshold=0.5
export const processMatchMaking=async(currentUserId:string)=>{
    try{
        let similarities=[]
        const userEmbeddings=await getAllUserEmbedding()
        if(!userEmbeddings) throw Error('could not find AllUserEmbeddings!');
        const currentUserEmbedding=userEmbeddings[`${currentUserId}`]
        if(!currentUserEmbedding) throw new Error('User not found')
        const currentUserEmbeddingArray=JSON.parse(currentUserEmbedding)
        console.log('currentUserId: ', currentUserId,'currentUserEmbedding: ',currentUserEmbeddingArray)
        //console.log('all embeddings: ',userEmbeddings)
        //const previousMatches=await getUserMatches(userId);
        //console.log(previousMatches);
        for(const userId in userEmbeddings){
            const result=await checkUserMatch(currentUserId, userId);
            console.log('usermatch result for ',userId,' : ',result);
            if(userId===`${currentUserId}` || result===1) continue
            const embedding=JSON.parse(userEmbeddings[userId])
            const cosineSimilarity=calculateCosineSimilarity(currentUserEmbeddingArray,embedding)
            console.log(userId,', cosineValue: ',cosineSimilarity)
            if(cosineSimilarity>=threshold){
                console.log(`User ${currentUserId} is matched with ${userId} with a similarity of ${cosineSimilarity}`)
                similarities.push({userId,cosineSimilarity})
            }
            similarities.sort((a,b)=>b.cosineSimilarity-a.cosineSimilarity)
        }
        console.log('topMatch: ',similarities[0])
        const topMatch=similarities[0]
        const targetUserId=topMatch.userId
        const targetUserSocketId=await getUserSocketId(targetUserId)
        const currentUserSocketId=await getUserSocketId(currentUserId)
        console.log('Target socket:', targetUserSocketId);
        console.log('Current socket:', currentUserSocketId);
        if(!targetUserSocketId || !currentUserSocketId) throw new Error('Target user not found')
        SocketIoInstance.to(currentUserSocketId).emit('match-found',{targetId:targetUserSocketId})
        SocketIoInstance.to(targetUserSocketId).emit('match-found',{targetId:currentUserSocketId})
        SocketIoInstance.to(targetUserSocketId).emit('start-webrtc-listner',{targetId:currentUserSocketId})
        //SocketIoInstance.to(currentUserSocketId).emit('start-webrtc',{targetId:targetUserSocketId});

    }catch(err){
        console.log(err);
    }
}

const calculateCosineSimilarity=(a:number[],b:number[])=>{
    if(a.length!==b.length) throw new Error('Vectors must be of the same length')
    const dotProduct=math.dot(a,b)
    const magA:any=math.norm(a)
    const magB:any=math.norm(b)
    const cosineSimilarity=dotProduct/(magA*magB)
    return cosineSimilarity
}