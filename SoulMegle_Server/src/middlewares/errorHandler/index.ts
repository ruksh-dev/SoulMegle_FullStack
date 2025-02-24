const errorHandler=(err:any,req:any,res:any,next:any)=>{
    console.log(err)
    res.status(500).json({msg:'Internal Server Error'})
}
export default errorHandler;
