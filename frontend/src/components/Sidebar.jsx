import React,{useState,useEffect} from 'react'
import { assets } from "../assets/assets"
import { useNavigate } from 'react-router-dom'
import {getUserPlaylist} from "../api/playListApi"
import {useUser} from "@clerk/clerk-react"
const Sidebar = ({onCreatePlaylist,onHome}) => {
    const navigate=useNavigate();
    const {user}=useUser();
    const userId=user?.id;
    const [showPlaylists,setShowPlaylists]=useState(false);
    const [playlists,setPlaylists]=useState([]);
    const loadPlaylists = async () => {
  if (!userId) return; // Prevent calling API with undefined
  const res = await getUserPlaylist(userId);
  if (res.playlists) {
    setPlaylists(res.playlists);
  }
};
useEffect(() => {
  if (userId) loadPlaylists();
}, [userId]);
    const handleShowPlaylists=()=>
    {
        setShowPlaylists(true);
        loadPlaylists();
    }
   
    return (
        <div className="w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
            <div className='bg-[#121212] h-[15%] rounded flex flex-col justify-around'>
                <div onClick={()=>{setShowPlaylists(false); navigate('/'); onHome()}} className='flex items-center gap-3 pl-8 cursor-pointer'>
                    <img className='w-6' src={assets.home_icon} alt="" />
                    <p className='font-bold'>Home</p>
                </div>
                <div className='flex items-center gap-3 pl-8 cursor-pointer'>
                    <img className='w-6' src={assets.search_icon} alt="" />
                    <p className='font-bold'>Search</p>
                </div>
            </div>
            <div className='bg-[#121212] h-[85%] rounded'>
                <div className='p-4 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img className='w-8' src={assets.stack_icon} alt="" />
                        <p className='font-semibold'>Your Library</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <img className='w-5' src={assets.arrow_icon} alt="" />
                        <img className='w-5' src={assets.plus_icon} alt="" />
                    </div>
                </div>
               {
  !showPlaylists && (
    <>
      <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-center'>
        <h1>Create your first playlist</h1>
        <p className='font-light'>It's easy, we will help you</p>
        <button 
          onClick={onCreatePlaylist} 
          className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4'
        >
          Create Playlist
        </button>
      </div>
      <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-center mt-4'>
        <h1>Browse Your Playlists</h1>
        <p className='font-light'>Mood Swings Go on To Yours Comfort place</p>
        <button 
          onClick={handleShowPlaylists} 
          className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4'
        >
          Your Playlist
        </button>
      </div>
    </>
  )
}

{
  showPlaylists && (
    <div className="p-2">
      {playlists.length === 0 ? (
        <div className='p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-center'>
          <h1>No Playlists Yet!</h1>
          <p className='font-light'>Please create one to start enjoying your music.</p>
          <button 
            onClick={onCreatePlaylist} 
            className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4'
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-bold mb-2 px-2">Your Playlists</h2>
          <div className="flex flex-col gap-2 overflow-y-auto h-[70vh] px-2">
            {playlists.map(pl => (
              <div key={pl._id} className="flex items-center gap-3 cursor-pointer hover:bg-[#2a2a2a] p-2 rounded-md">
                <img 
                  src={pl.image || "https://via.placeholder.com/60"} 
                  className="w-12 h-12 rounded object-cover" 
                />
                <div>
                  <p className="font-semibold">{pl.name}</p>
                  <p className="text-sm text-gray-400">{pl.description || "No description"}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

                

            </div>
        </div>
    )
}

export default Sidebar
