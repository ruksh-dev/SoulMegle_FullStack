import { useNavigate } from 'react-router-dom';
interface AppbarProps {
    profile: {
        username: string;
    } | null;
    handleLogOut: () => void;
    handleSignIn: () => void;
}

const Appbar: React.FC<AppbarProps> = ({ profile, handleLogOut, handleSignIn }) => {
    const navigate=useNavigate()
    const handleCall=()=>{
        navigate('/initiate-match')
    }
    return (
        <nav className='w-5/6 flex items-center justify-between bg-gradient-to-r from-blue-600 to-teal-500 text-amber-200 shadow-lg p-4 rounded-full'>
            <div className='text-3xl font-bold tracking-wider '>SoulMegle</div>
            <div className='flex items-center space-x-6'>
                {profile ? (
                    <>
                        <div className='text-lg font-semibold'>{profile.username}</div>
                        <button onClick={()=>{navigate('/')}} className='bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-50 hover:scale-105 transform transition-all duration-300'>
                            Home
                        </button>
                        <button onClick={()=>navigate('/get-user-interests')} className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-50 hover:scale-105 transform transition-all duration-300">
                            Add Interests
                        </button>
                        <button onClick={handleCall} className='bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-50 hover:scale-105 transform transition-all duration-300'>
                            Call
                        </button>
                        <button
                            onClick={handleLogOut}
                            className='bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-50 hover:scale-105 transform transition-all duration-300'
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleSignIn}
                        className='bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-50 hover:scale-105 transform transition-all duration-300'
                    >
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Appbar;