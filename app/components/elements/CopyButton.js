"use client";

import { useEffect, useState } from 'react';

export default function CopyButton({ copyData }) {
    const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {

    let completeUrl= process.env.NEXT_PUBLIC_BASE_URL +'/product/'+copyData;
    navigator.clipboard.writeText(completeUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((error) => {
        console.error('Failed to copy text: ', error);
      });
  };

  return (
    <button
       onClick={handleCopy}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      {isCopied ? 'Copied!' : 'Copy URL'}
    </button>
  );
}
