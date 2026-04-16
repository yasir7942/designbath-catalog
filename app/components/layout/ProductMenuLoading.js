"use client";

import { ClipLoader } from "react-spinners";

export default function ProductMenuLoading() {
    return (
        <div className="flex items-center justify-center py-6">
            <ClipLoader color="#0047ff" size={30} />
        </div>
    );
}