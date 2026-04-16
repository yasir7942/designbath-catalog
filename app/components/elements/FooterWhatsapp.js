"use client";

import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923246669988";

export default function FooterWhatsapp() {
    const handleClick = () => {
        const message = encodeURIComponent(
            `Hello, I am interested in this product: ${window.location.href}`
        );

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

        window.open(url, "_blank");
    };

    return (
        <div className="fixed bottom-4 right-20 z-[9999]">
            <button
                onClick={handleClick}
                title="Chat with us on WhatsApp"
                className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg hover:bg-green-600 animate-pulse"
            >
                <FaWhatsapp size={22} />


            </button>
        </div>
    );
}