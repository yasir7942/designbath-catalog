
import React from 'react';

const VideoPopup = ({ videoId, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative w-full max-w-3xl bg-white p-4">
        <button 
          className="absolute px-4 py-2 bg-slate-950   top-0 right-0  animate-colorChange"
          onClick={onClose}
        >
          Close X
        </button>
         
        <iframe
          width="100%"
          height="400"
          className='mt-1'
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPopup;
