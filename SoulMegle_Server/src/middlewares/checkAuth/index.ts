const checkAuth=async(req:any,res:any,next:any)=>{
    try{
        if(!req.isAuthenticated()) return res.status(401).json({message:'Unauthorized'})
        next()
    }catch(err){
        next(err)
    }
}
export default checkAuth