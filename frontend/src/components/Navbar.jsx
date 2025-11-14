
import React, { useEffect } from "react";
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { syncUser } from "../api/userApi";

const Navbar = () => {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && user && user.fullName && user.primaryEmailAddress) {
      syncUser(user.id,
        user.fullName,
          user.primaryEmailAddress?.emailAddress

      ); 
    }
  }, [isLoaded, user]);

  return (
    <>
      <div className="w-full flex justify-between items-center font-semibold">
        <div className="flex items-center gap-2">
          <img onClick={() => navigate(-1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer" src={assets.arrow_left} />
          <img onClick={() => navigate(1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer" src={assets.arrow_right} />
        </div>

        {!user ? (
          <div onClick={openSignIn} className="flex items-center gap-4">
            <p className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block">
              Login
            </p>
          </div>
        ) : (
          <UserButton />
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer">All</p>
        <p className="bg-black px-4 py-1 rounded-2xl cursor-pointer">Music</p>
        <p className="bg-black px-4 py-1 rounded-2xl cursor-pointer">Podcasts</p>
      </div>
    </>
  );
};

export default Navbar;
