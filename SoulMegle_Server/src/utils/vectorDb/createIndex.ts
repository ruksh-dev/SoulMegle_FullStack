import pc from './index'
const createIndex=async()=>{
try{
const indexName = 'user-interests';

const response=await pc.createIndex({
  name: indexName,
  dimension: 384, // Replace with your model dimensions
  metric: 'cosine', // Replace with your model metric
  spec: { 
    serverless: { 
      cloud: 'aws', 
      region: 'us-east-1' 
    }
  } 
});
console.log(response)
}catch(err){
    console.log(err)
}
}
createIndex();
