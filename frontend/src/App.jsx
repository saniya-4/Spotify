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
  return (
    <div className="h-screen bg-black">
      {
        songsData.length!=0
        ?
        <>
         <div className="h-[90%] flex">
        <Sidebar  onCreatePlaylist={()=>setActivePage('playlist')}
          onHome={()=>setActivePage('display')}/>
          {
            activePage==='playlist'?
            (<PlayList userId={user?.id}/>):
            ( <Display/>)
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
