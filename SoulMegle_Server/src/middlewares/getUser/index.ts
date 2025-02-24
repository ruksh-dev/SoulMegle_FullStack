const getUser=async(req:any,res:any,next:any)=>{
    try{
        return res.status(200).json({user:{
            id: req.user.id,
            username: req.user.username
        }})
    }catch(err){
        next(err)
    }
}
export default getUser;
