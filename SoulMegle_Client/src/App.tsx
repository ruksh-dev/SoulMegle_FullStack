import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AudioRecorder from './components/AudioRecorder';
import Home from './components/Home/index';
import axios from 'axios'
import './App.css';
import Appbar from './components/Appbar';
import InitiateMatch from './components/InitiateMatch/index2';

const App: React.FC = () => {
  
  const [profile,setProfile]=useState<any>(null)
  console.log('profile: ',profile)
  useEffect(()=>{
    const checkUser=async()=>{
      const response=await axios.get('https://soulmegle.happyforever.com/api/user',{
        withCredentials: true
      })
      setProfile(response.data.user)
    }
    checkUser();
  },[])
  const handleSignIn=()=>{
    window.location.href=`https://soulmegle.happyforever.com/user/auth/google?redirectUrl=${encodeURIComponent(window.location.href)}`
  }
  const handleLogOut=()=>{
    window.location.href=`https://soulmegle.happyforever.com/logout?redirectUrl=${encodeURIComponent(window.location.href)}`
  }
  

  return (
    <Router>
       <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
     {profile?
     <div className='flex justify-center items-center'>
     <Appbar profile={profile} handleLogOut={handleLogOut} handleSignIn={handleSignIn}/>  
     </div>
     :
     <div className='flex justify-center items-center'>
     <Appbar profile={profile} handleLogOut={handleLogOut} handleSignIn={handleSignIn}/>
     </div>
      }
      <Routes>
        <Route path="/" element={<Home handleSignIn={handleSignIn} profile={profile}/>} />
        <Route path="/get-user-interests" element={<AudioRecorder profile={profile}/>} />
        <Route path="/initiate-match" element={<InitiateMatch />} />
      </Routes>
      </div>
    </Router>
  );
};

export default App;