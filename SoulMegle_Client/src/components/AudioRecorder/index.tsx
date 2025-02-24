
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AudioRecorder,useAudioRecorder } from 'react-audio-voice-recorder';
import axios from 'axios'

export default function RecordAudio({profile}:{profile:any}) {
    const audioBlobRef=useRef<HTMLAudioElement>(null)
    const [audioBlob,setAudioBlob]=useState<Blob | null>(null)
    const [audioUrl,setAudioUrl]=useState<string>('')
    const [isLoading,setIsLoading]=useState<boolean>(false)
    const [error, setError]=useState<string | null>(null)
    const [message,setMessage]=useState<string | null>(null)
    const recorderControls = useAudioRecorder()
    const navigate=useNavigate();
    useEffect(()=>{
      if(!profile) navigate('/');
    },[])

    const handleSave=async()=>{
      try{
        if(!audioBlob) return
        setIsLoading(true)
        const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const response=await axios.post('https://soulmegle.happyforever.com/api/user/process-user-traits',formData,{
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(response)
    setIsLoading(false)
    setMessage("AI has processed your audio successfully, You can start connecting now!")

      }catch(err){
        console.log(err)
        setError('Error saving audio')
        setIsLoading(false)
        setTimeout(()=>{
          setError(null)
        },3000)
      }

    }

    const handleRecordAgain=()=>{
      setAudioBlob(null)
      setAudioUrl('')
    }
    
  const addAudioElement = async(blob: Blob) => {
    try{
    const url = URL.createObjectURL(blob);
    //const audio=audioBlobRef.current
    // const audio = document.createElement('audio');
    setAudioUrl(url)
    setAudioBlob(blob)
    // document.body.appendChild(audio);
    
    }catch(err){
      console.log(err)
    }

  };
  
  return (
    <div className='w-1/2 flex flex-col items-center justify-center p-5 mt-2'>
    {!isLoading && 
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
          // autoGainControl,
          // channelCount,
          // deviceId,
          // groupId,
          // sampleRate,
          // sampleSize,
        }}
        onNotAllowedOrFound={(err) => console.table(err)}
        downloadOnSavePress={false}
        downloadFileExtension="webm"
        mediaRecorderOptions={{
          audioBitsPerSecond: 128000,
        }}
         showVisualizer={true}
         recorderControls={recorderControls} 
      />
      }
      <br />
      {isLoading && !error && <div className='flex flex-col items-center justify-center gap-2'><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}
      {!isLoading && audioBlob && audioUrl && (
        <div className='flex flex-col items-center justify-center gap-2'>
          <audio ref={audioBlobRef} src={audioUrl} controls />
          <div className='flex flex-row items-center justify-center gap-2'>
            <button onClick={handleSave} className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200'>Save</button>
            <button onClick={handleRecordAgain} className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors duration-200'>Record Again</button>
          </div>
        </div>
      )}
      {error && <div className='text-red-500'>{error}</div>}
      {message && <div className='text-green-500'>{message}</div>}
    </div>
  );
}

