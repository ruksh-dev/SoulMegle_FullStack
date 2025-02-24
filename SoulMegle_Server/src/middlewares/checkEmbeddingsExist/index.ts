import pc from '../../utils/vectorDb/index'
const checkEmbeddingsExist=async(req:any,res:any,next:any)=>{
  try{
    const userId=req.user.id;
    const userInterestsIndex=pc.index('user-interests')
    const result=await userInterestsIndex.fetch([userId]);
    //console.log(JSON.stringify(result))
    if(result.records && result.records[userId]) return res.status(200).json({msg: 'user embeddings exist'});
    return res.status(404).json({msg: 'embeddings not found'})

  }catch(err){next(err)}
}
export default checkEmbeddingsExist;