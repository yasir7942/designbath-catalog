"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { getProductMenuData } from "../../data/loader";

export default function ProductMenu() {
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileBrandOpen, setMobileBrandOpen] = useState(null);
    const [desktopOpenBrand, setDesktopOpenBrand] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function loadMenu() {
            try {
                setLoading(true);
                setError("");

                const data = await getProductMenuData();

                if (!ignore) {
                    setMenuData(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("ProductMenu Error:", err);
                if (!ignore) {
                    setMenuData([]);
                    setError("Failed to load menu.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadMenu();

        return () => {
            ignore = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="w-full relative z-[9999] overflow-visible bg-white">
                <div className="flex items-center justify-center py-4">
                    <ClipLoader color="#0047ff" size={28} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full relative z-[9999] overflow-visible bg-white">
                <div className="text-red-600 text-sm py-3 text-center">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full relative z-[9999] overflow-visible bg-white border-t border-b">
            {/* Mobile top bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Products Menu</h3>
                <button
                    type="button"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="rounded border px-4 py-1 text-base text-gray-700 bg-white"
                >
                    {mobileOpen ? "Close" : "Menu"}
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`${mobileOpen ? "block" : "hidden"} md:hidden`}>
                <ul className="divide-y">

                    <li key="Mobile-Home" >
                        <div className="flex items-center justify-between px-4 py-3">
                            <Link
                                href={`/`}
                                className="font-medium text-gray-900"
                                onClick={() => setMobileOpen(false)}
                            >
                                Home
                            </Link> </div> </li>
                    {menuData.map((brand) => {
                        const isOpen = mobileBrandOpen === brand.id;

                        return (
                            <li key={brand.id} className="overflow-visible">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <Link
                                        href={`/product-grid/brand/${brand.slug}`}
                                        className="font-medium text-gray-900"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {brand.name}
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMobileBrandOpen((prev) =>
                                                prev === brand.id ? null : brand.id
                                            )
                                        }
                                        className="ml-3 text-xl text-gray-600"
                                    >
                                        {isOpen ? "-" : "+"}
                                    </button>
                                </div>

                                {isOpen && (
                                    <div className="bg-gray-50 px-4 pb-3">
                                        {brand.tags?.length ? (
                                            <ul className="space-y-2 pt-2">
                                                {brand.tags.map((tag) => (
                                                    <li key={tag.id}>
                                                        <Link
                                                            href={`/product-grid/filter/${tag.slug}`}
                                                            className="block text-sm text-gray-700 hover:text-blue-600"
                                                            onClick={() => setMobileOpen(false)}
                                                        >
                                                            {tag.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="pt-2 text-sm text-gray-400">
                                                No sub categories
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}

                    <li key="Mobile-Home" >
                        <div className="flex items-center justify-between px-4 py-3">
                            <Link
                                href={`/product-report`}
                                className="font-medium text-gray-900"
                                onClick={() => setMobileOpen(false)}
                            >
                                Product Map
                            </Link> </div> </li>

                </ul>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:block relative z-[9999] overflow-visible">
                <ul className="flex flex-wrap justify-center items-center gap-8 px-6 py-3 relative z-[9999] overflow-visible">


                    <li
                        key="home"
                        className="relative overflow-visible"
                    >
                        <Link
                            href={`/`}
                            className="inline-flex items-center font-medium text-gray-900 hover:text-blue-600 py-2 whitespace-nowrap"
                        >
                            Home
                        </Link>
                    </li>
                    {menuData.map((brand) => {
                        const isOpen = desktopOpenBrand === brand.id;

                        return (
                            <li
                                key={brand.id}
                                className="relative overflow-visible"
                                onMouseEnter={() => setDesktopOpenBrand(brand.id)}
                                onMouseLeave={() => setDesktopOpenBrand(null)}
                            >
                                <Link
                                    href={`/product-grid/brand/${brand.slug}`}
                                    className="inline-flex items-center font-medium text-gray-900 hover:text-blue-600 py-2 whitespace-nowrap"
                                >
                                    {brand.name}
                                </Link>

                                {isOpen && (
                                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 z-[9999]">
                                        <div className="min-w-[240px] max-w-[320px] rounded-md border border-gray-200 bg-white shadow-xl p-3">
                                            {brand.tags?.length ? (
                                                <ul className="space-y-1">
                                                    {brand.tags.map((tag) => (
                                                        <li key={tag.id}>
                                                            <Link
                                                                href={`/product-grid/filter/${tag.slug}`}
                                                                className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                                            >
                                                                {tag.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-gray-400">
                                                    No sub categories
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}

                    <li
                        key="home"
                        className="relative overflow-visible"
                    >
                        <Link
                            href={`/product-report`}
                            className="inline-flex items-center font-medium text-gray-900 hover:text-blue-600 py-2 whitespace-nowrap"
                        >
                            Product Map
                        </Link>
                    </li>


                </ul>
            </div>
        </div>
    );
}