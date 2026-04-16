import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import ScrollToTopWrapper from "./components/elements/ScrollToTopWrapper";
import Link from "next/link";
import ProductMenu from "./components/layout/ProductMenu";
import ProductMenuLoading from "./components/layout/ProductMenuLoading";
import { Suspense } from "react";
import FooterWhatsapp from "./components/elements/FooterWhatsapp";

const inter = Inter({ subsets: ["latin"] });



export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
  title: "Design Bath Product Catalog",
  description: "Design Bath Product Catalog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <div className="flex flex-col justify-start items-center mt-5 pb-3 border-b-2 border-gray-600">
          <Link href="/">
            <Image
              src="/images/logo.png"
              width={200}
              height={50}
              alt="Designbath Logo"
            />
          </Link>

          <div className="mt-2">
            <h1>Main Walton Road Near Defense More Lahore</h1>
          </div>

          <Suspense fallback={<ProductMenuLoading />}>
            <ProductMenu />
          </Suspense>
        </div>

        <main className="mt-5 px-4 md:px-6 lg:px-16 relative z-50 flex-1">
          {children}
        </main>

        <footer className="mt-auto bg-gray-800 text-white text-center p-3">
          copyright reserved by DesignBath
          <ScrollToTopWrapper />
          <FooterWhatsapp />


        </footer>
      </body>
    </html>
  );
}