import React,{useContext,useState} from 'react'
import Sidebar from './components/Sidebar'
import Player from './components/Player'
import Display from './components/Display'
import { PlayerContext } from './context/PlayerContext'
import PlayList from './components/PlayList'
import {useUser} from '@clerk/clerk-react'
const App = () => {
  const {audioRef,track,songsData}=useContext(PlayerContext);
  const {user}=useUser();
  
  
  const [activePage,setActivePage]=useState('display');
  const [activePlaylist,setActivePlaylist]=useState(null);
  return (
    <div className="h-screen bg-black">
      {
        songsData.length!=0
        ?
        <>
         <div className="h-[90%] flex">
        <Sidebar  onCreatePlaylist={()=>{setActivePage('playlist'); setActivePlaylist(null)}}
          onHome={()=>{setActivePage('display');setActivePlaylist(null)}}
          onPlaylistClick={(playlist)=>{
            setActivePage('display');
            setActivePlaylist(playlist)
          }}/>
          {
            activePage==='playlist'?
            (<PlayList userId={user?.id}/>):
            ( <Display activePlaylist={activePlaylist}/>)
          }
          
       
        
      </div>
      <Player />
        </>:null

      }
     
      <audio ref={audioRef}  src={track?track.file:""} preload="auto"></audio>
      
    </div>
  )
}

export default App
