/** @type {import('next').NextConfig} */

 
let unOptimized = true;
let fileRoutes = true;

if (process.env.MODE === "pro") {
    unOptimized = false;
    fileRoutes = false;
}



  

const nextConfig = {
    
    reactStrictMode: true,
   
    // useFileSystemPublicRoutes: fileRoutes,
 


    images: {
      unoptimized: unOptimized,   //false in in live server make webp images 
        remotePatterns: [
            
            {
                hostname: "designbath.pk",
                protocol: "https", 
            },
            {
                hostname: "products.designbath.pk",
                protocol: "https", 
            },
            {
                hostname: "localhost",
                protocol: "http", 
            }
        ],
    },

     

     
    

};

export default nextConfig;

