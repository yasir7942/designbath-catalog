import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Design Bath Product Catalog",
  description: "Design Bath Product Catalog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={inter.className}>
      <div className="flex flex-col justify-start items-center mt-5 pb-3  border-b-2 border-gray-600 ">
       <a href="/" > <Image src='/images/logo.png'  width={200}
          height={50}
          alt="Designbath Logo" />   </a>
          <div className="mt-2">
             <h1>Main Walton Road Near Defense More Lahore</h1>
           </div>  
          
       </div>
      
           <div className=" mt-5   px-4 md:px-6 lg:px-16  relative z-50"> 
               {children}
           </div>
      
      <footer className="bg-gray-800 text-white text-center p-2">
              copyright received by DesignBath
      </footer>
      
      </body>
      
    </html>
  );
}
