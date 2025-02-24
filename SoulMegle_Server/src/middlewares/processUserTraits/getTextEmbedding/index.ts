import hfClient from "../../../utils/huggingFaceClient";
const getTextEmbedding=async(text:string)=>{
    try{
    const output = await hfClient.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
    });
    console.log(output)
    return output;
    }catch(err){
        throw err;
    }
}
export default getTextEmbedding;