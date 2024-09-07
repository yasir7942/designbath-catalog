"use client";
import React, { useState } from 'react';
import VideoPopup from '../elements/VideoPopup';
import Image from 'next/image';

const VideoFrame = ({ videoCode }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

 // console.log(videoCode);

  return (
    <div className="relative">
      <Image
        src="/images/video-icon.png"  
        alt="Watch Video"
        width={100}
        height={100}
        className="cursor-pointer filter grayscale hover:grayscale-0 transition duration-300"
        onClick={handleOpenPopup}
      />
      
      {isPopupOpen && (
        <VideoPopup
          videoId= {videoCode} 
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default VideoFrame;
