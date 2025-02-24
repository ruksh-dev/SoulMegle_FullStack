import getAudioText from "./getAudioText";
import getTextEmbedding from "./getTextEmbedding";
import storeUserEmbedding from "./storeUserEmbedding";

const processUserTraits=async(req:any,res:any,next:any)=>{
    try{
        if(!req.file) return res.status(400).json({msg:'Audio file is required'})
        const audioData = new Blob([req.file.buffer], { type: req.file.mimetype });
        const audioText=await getAudioText(audioData)
        if (!audioText || !audioText.text) {
            throw new Error('Failed to transcribe audio');
        }

        const textEmbedding=await getTextEmbedding(audioText.text)
        if(!textEmbedding) throw new Error('Error in getting text embedding')
    
        const response=await storeUserEmbedding(textEmbedding,req.user.id)
        if(!response) throw new Error('Error in storing user embedding')
        
        return res.status(200).json({msg:'User embedding stored successfully!'})        
    }catch(err){
        next(err)
    }
    
}
export default processUserTraits;

