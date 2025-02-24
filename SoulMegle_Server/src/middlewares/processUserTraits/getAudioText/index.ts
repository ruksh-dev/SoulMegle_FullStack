import hfClient from "../../../utils/huggingFaceClient";

const getAudioText=async(data:any):Promise<any>=>{
    try{
    const output = await hfClient.automaticSpeechRecognition({
        data,
        model: "openai/whisper-medium",
        provider: "hf-inference",
    });
    console.log(output)
    return output;
    
    }catch(err){
      throw err;
    }
}
export default getAudioText;
