
  


  export const  getImageUrl = (path)=> {
    const dummyImage = "/images/no-image.png";
     
   if( process.env.NEXT_PUBLIC_MODE == "dev" ){
    if (path.trim().length === 0)
      return dummyImage;
     return process.env.NEXT_PUBLIC_LOCAL_BASE_IMAGE_URL + path;
   }
     else{
  
      if (path.trim().length === 0)
        return dummyImage;
  
      
        return process.env.NEXT_PUBLIC_ADMIN_BASE_URL +path;
     }
  }