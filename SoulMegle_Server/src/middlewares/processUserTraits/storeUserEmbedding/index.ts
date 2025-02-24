import pc from "../../../utils/vectorDb";

const storeUserEmbedding=async(embedding:any,id:string)=>{
    try{
        const UserInterestsIndex=pc.index('user-interests')
        const response=await UserInterestsIndex.upsert([
            {
                id,  // user id
                values: embedding  // array of floats
            }
        ])
        console.log('vector embedding stored response: ',response)
        return true
    }catch(err){
        throw err;
    }
}
export default storeUserEmbedding;