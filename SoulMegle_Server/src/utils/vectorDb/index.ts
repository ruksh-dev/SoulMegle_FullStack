import { Pinecone } from '@pinecone-database/pinecone';
import {config} from 'dotenv'
import path from 'path'
config({path: path.resolve(__dirname,'../../../.env')})

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

export default pc;
