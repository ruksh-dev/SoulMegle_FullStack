import pc from './index'
const testingInsert=async()=>{
    try{
        const indexName = 'user-interests';
        const UserInterestsIndex=pc.index(indexName)
        const response=await UserInterestsIndex.query({
            id: '5d5a2fb2-1d32-460b-ab5a-5b936f05eadf',
            topK: 1,
        })
        console.log(response)
        
    }catch(err){
        console.log(err)
    }
}
testingInsert();
