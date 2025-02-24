import { io, Socket } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const InitiateMatch = () => {
    const navigate=useNavigate()
    const peerSocketIdRef = useRef<string | null>(null);
    const isRemoteDescSetRef = useRef(false);
    const capturedIceCandidateRef = useRef<RTCIceCandidate[]>([]);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [initSocket, setInitSocket] = useState(false);

    const checkUserTraitsExist=async()=>{
        const response=await axios.get('https://soulmegle.happyforever.com/api/user/check-traits',{
            withCredentials:true
        })
        console.log(response.data)
        if(response.status===404){
            navigate('/get-user-interests')
        }
    }
    useEffect(()=>{
        checkUserTraitsExist()
    },[])

    const createRTCPeerConnection = () => {
        console.log('Initializing RTCPeerConnection');
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                // Add TURN servers here for better connectivity
            ],
        });
        peerConnectionRef.current = peerConnection;

        if(localStream) {
            console.log('adding local stream to peer connection')
            localStream.getTracks().map(track => 
                peerConnectionRef.current!.addTrack(track, localStream)
            )
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current && peerSocketIdRef.current) {
                console.log('Sending ICE candidate:', event.candidate);
                socketRef.current.emit('signal', {
                    candidate: event.candidate,
                    targetId: peerSocketIdRef.current
                });
            }
        };

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event);
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setRemoteStream(event.streams[0]);
                setIsConnected(true);
            }
        };

        // Connection state monitoring
        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'disconnected') {
                handleDisconnect();
                setIsConnected(false);
            }
            if(peerConnection.iceConnectionState === 'connected') {
                setIsConnected(true);
                setIsConnecting(false);
            }
        };

        return peerConnection;
    };

    const initializeLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            throw err;
        }
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        try {
            if(!peerConnectionRef.current) {
                throw new Error('no peer connection, not able to handle offer')
            }
            const peerConnection = peerConnectionRef.current 
            

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            isRemoteDescSetRef.current = true;
            return answer;
        } catch (err) {
            console.error('Error handling offer:', err);
        }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        try {
            if (!peerConnectionRef.current) throw new Error('no peer connection, not able to handle answer')
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                isRemoteDescSetRef.current = true;
        } catch (err) {
            console.error(err);
        }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidate) => {
        try {
            console.log('received ICE candidate:', candidate);
            if(!isRemoteDescSetRef.current || !peerConnectionRef.current) {
                if(!peerConnectionRef.current) console.log('no peer connection, adding candidate to buffer')
                capturedIceCandidateRef.current.push(candidate);
                return;
            }
            else{
                if(isRemoteDescSetRef.current && capturedIceCandidateRef.current.length > 0) {
                    console.log('adding buffered candidates to peer connection')
                    capturedIceCandidateRef.current.forEach(async (candidate) => {
                        await peerConnectionRef.current!.addIceCandidate(candidate);
                    })
                    capturedIceCandidateRef.current = [];
                }
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (err) {
            console.error('Error handling ICE candidate:', err);
        }
    };

    const handleDisconnect = () => {
        // Clean up streams
        // if (localStream) {
        //     localStream.getTracks().forEach(track => track.stop());
        //     setLocalStream(null);
        // }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }
        
        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

    };

    const generateOffer=async()=>{
        try{
            if(!peerConnectionRef.current) {
                console.log('not able to generate offer')
                return
            }
            console.log('generating offer...')
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            return offer   
        }catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        if(initSocket) { 
        const socket = io('https://soulmegle.happyforever.com', {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 2,
            reconnectionDelay: 1000
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to signaling server:', socket.id);
        });

        socket.on('match-found', (data) => {
            if (data.targetId) {
                peerSocketIdRef.current = data.targetId;
                //setIsConnecting(true);
            }
        });

        socket.on('start-webrtc-listner',async()=>{
            try{
                await initializeLocalMedia()
                await createRTCPeerConnection()
                console.log('listner ready!, waiting for peer: ', peerSocketIdRef.current)
                socket.emit('listner-ready',{targetId:peerSocketIdRef.current})
            }catch(err){
                console.log(err)
            }
        })

        socket.on('end-webrtc',(data)=>{
            if(data.targetId === peerSocketIdRef.current) handleNext()
        })

        socket.on('start-webrtc-source',async()=>{
            try{
                await initializeLocalMedia()
                await createRTCPeerConnection()
                console.log('source ready to generate offer')
                const offer=await generateOffer()
                if(offer) {
                    socket.emit('signal',{offer,targetId:peerSocketIdRef.current})
                    console.log('sent offer to peer')
                }
                
            }catch(err){
                console.log(err)
            }
        })

        

        socket.on('signal', async (data) => {
            if (data.offer) {
                const answer=await handleOffer(data.offer);
                if(answer) {
                    socket.emit('signal',{answer,targetId:peerSocketIdRef.current})
                    console.log('sent answer to peer')
                }
            }
            else if (data.answer) await handleAnswer(data.answer);
            else if (data.candidate) await handleIceCandidate(data.candidate);
        });

        socket.on('disconnect', handleDisconnect);
    }

        return () => {
             handleDisconnect();
            if(socketRef.current) {
                socketRef.current.disconnect();
                setInitSocket(false);
            }
        };
    }, [initSocket]);

    
    // useEffect(() => {
    //     if (isConnecting) {
    //         if(localStream && peerConnectionRef.current) {
    //             Promise.all(
    //                 localStream.getTracks().map(track => 
    //                     peerConnectionRef.current!.addTrack(track, localStream)
    //                 )
    //             ).then(() => {
    //                 socketRef.current?.emit('ready-to-connect', {
    //                     targetId: peerSocketIdRef.current
    //                 });
    //             });
    //         }
    //     }
    // }, [isConnecting]);

    useEffect(()=>{
        initializeLocalMedia()
    },[])

    const handleStart = () => {
        setInitSocket(true);
        setIsConnecting(true)
    };

    useEffect(()=>{
        if(initSocket) {
            console.log('emitting start-matchmaking')
            if(socketRef.current) socketRef.current.emit('start-matchmaking');
        }
    },[initSocket])

    const handleEnd = () => {
        if(isConnected) {
            socketRef.current?.emit('end-call',{targetId:peerSocketIdRef.current})
        }
        peerSocketIdRef.current = null;
        capturedIceCandidateRef.current = [];
        isRemoteDescSetRef.current = false;
        if(socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        handleDisconnect();
        setIsConnecting(false);
        setIsConnected(false);
        setInitSocket(false);
    }

    const handleNext=()=>{
        if(isConnected) {
            socketRef.current?.emit('end-call',{targetId:peerSocketIdRef.current})
        }
        peerSocketIdRef.current = null;
        capturedIceCandidateRef.current = [];
        isRemoteDescSetRef.current = false;
        handleDisconnect();
        if(socketRef.current) {
            console.log('emitting next-matchmaking')
            socketRef.current.emit('next-matchmaking')
        }
        setIsConnecting(true);
    }

    return (
        <div className="p-4">
            <div className="flex items-center gap-4">
            {!isConnected && !isConnecting &&
            <button
                onClick={handleStart}
                disabled={isConnecting}
                className="px-4 py-2 rounded-md text-white bg-black 
                          hover:bg-slate-700 disabled:bg-slate-400"
            >
                Start
            </button>}
            {isConnecting && (
                <button 
                    disabled
                    className="px-4 py-2 rounded-md text-white bg-slate-400"
                >
                    Connecting...
                </button>
            )}
            {isConnected && !isConnecting &&
              <button 
                onClick={handleNext}
                className="px-4 py-2 rounded-md text-white bg-black hover:bg-slate-700"
                >
                Next
              </button>
            }
            {(isConnected || isConnecting) && (
                <>
                    <button 
                        onClick={handleEnd}
                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                        {isConnecting?'Stop':'End'}
                    </button>
                </>
            )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="relative">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full rounded-lg bg-slate-200"
                    />
                    <span className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">
                        You
                    </span>
                </div>
                <div className="relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg bg-slate-200"
                    />
                    <span className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded">
                        Peer
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InitiateMatch;