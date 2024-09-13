"use client";

 
export default function ShareButton({productName, price, discount, slug}) {
   
  const isDiscounted = discount > 0;
  
   
  const text = "Price: " + price + "/-  " + (isDiscounted   ? "Discounted Pirce: " +  discount+"/-" : "");
 
   
 

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: text ,
          url: process.env.NEXT_PUBLIC_BASE_URL +'/product/'+ slug+'%0A',  
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  return (
    <div>
      <button onClick={handleShare} className="px-4 py-2 bg-blue-500 text-white rounded">
        Share / Send
      </button>
    </div>
  );
}
