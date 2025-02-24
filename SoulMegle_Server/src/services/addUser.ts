import pc from '../utils/vectorDb/index'
import matchMakingQueue from './redisQueue'
import {addUserEmbedding} from './redisService'
const addUser=async(req:any,res:any,next:any)=>{
    try{
        const userId=req.user.id;
        const UserInterestsIndex=pc.index('user-interests')
        const response = await UserInterestsIndex.fetch(userId);
        const vectorEmbedding = response.records[`${userId}`].values
        console.log(vectorEmbedding)
        await matchMakingQueue.add({userId})
        res.status(200).json({vectorEmbedding})

    }catch(err){
        next(err)
    }

}
export default addUser;

