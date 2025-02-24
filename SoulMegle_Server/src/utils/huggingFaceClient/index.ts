import { HfInference } from "@huggingface/inference";
import {config} from 'dotenv'
import {resolve} from 'path'
config({path:resolve(__dirname,'../../../.env')})
const HF_KEY=process.env.HF_KEY
if(!HF_KEY) throw new Error('HF_KEY is not set')
const hfClient = new HfInference(HF_KEY);
export default hfClient;
