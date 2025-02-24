import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Home=({handleSignIn,profile}:{handleSignIn:()=>void,profile:any})=>{
    const [isInterestsAdded,setIsInterestsAdded]=useState(false)
    const checkInterests=async()=>{
        try{
            const response=await axios.get('https://soulmegle.happyforever.com/api/user/check-traits',{
                withCredentials:true
            })
            if(response.status===200){
                setIsInterestsAdded(true)
            }

        }catch(err){
            console.log(err)
        }
    }
    useEffect(()=>{
        checkInterests()
    },[])
    const navigate=useNavigate();
    const handleGetStarted=()=>{
        if(!profile) handleSignIn();
        else if(profile && !isInterestsAdded) navigate('/get-user-interests');
        else if(profile && isInterestsAdded) navigate('/initiate-match');
    }
    if(profile){
        if(isInterestsAdded){
            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
          <div className="text-4xl font-bold mb-4 animate-bounce">
            Welcome to SoulMegle
          </div>
          <div className="text-xl mb-8 font-semibold">
            AI has found your perfect match. Dive into a conversation now!
          </div>
          <div>
            <button onClick={handleGetStarted} className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-purple-100 hover:scale-105 transform transition-all duration-300">
              Call
            </button>
          </div>
        </div>
            )
        }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
          <div className="text-4xl font-bold mb-4 animate-bounce">
            Welcome to SoulMegle
          </div>
          <div className="text-xl mb-8 font-semibold">
           Let AI find your best match. Record your interests and discover like-minded souls!
          </div>
          <div>
            <button onClick={handleGetStarted} className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-purple-100 hover:scale-105 transform transition-all duration-300">
              Add
            </button>
          </div>
        </div>
    )
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
          <div className="text-4xl font-bold mb-4 animate-bounce">
            Welcome to SoulMegle
          </div>
          <div className="text-xl mb-8 font-semibold">
          AI-powered connections start here. Sign in and let the universe do the matching!
          </div>
          <div>
            <button onClick={handleGetStarted} className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-purple-100 hover:scale-105 transform transition-all duration-300">
              Get Started
            </button>
          </div>
        </div>
    )


}
export default Home;