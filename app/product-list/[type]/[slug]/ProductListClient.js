"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
    getProudctListByBrand,
    getProudctListByFilter,
} from "../../../data/loader";
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "../../../libs/helpers";
import { FiCopy, FiCheck } from "react-icons/fi";

const ProductListClient = ({ params }) => {
    const { type, slug } = use(params);

    const [products, setProducts] = useState([]);
    const [listType, setListType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedSlug, setCopiedSlug] = useState(null);

    const handleCopy = (e, slug) => {
        e.preventDefault();

        const fullUrl = `${window.location.origin}/product/${slug}`;
        navigator.clipboard.writeText(fullUrl);

        setCopiedSlug(slug);

        setTimeout(() => {
            setCopiedSlug(null);
        }, 2000);
    };

    useEffect(() => {
        let ignore = false;

        const loadProducts = async () => {
            try {
                setLoading(true);
                let fetchedProducts = [];
                let fetchedListType = "";

                if (type === "brand") {
                    fetchedProducts = await getProudctListByBrand(slug);
                    fetchedListType = fetchedProducts?.[0]?.brand?.name || "";
                } else {
                    fetchedProducts = await getProudctListByFilter(slug);
                    fetchedListType = fetchedProducts?.[0]?.tags?.[0]?.name || "";
                }

                if (!ignore) {
                    setProducts(fetchedProducts || []);
                    setListType(fetchedListType);
                }
            } catch (err) {
                setError("Failed to load products");
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadProducts();

        return () => (ignore = true);
    }, [type, slug]);

    const groupedProducts = useMemo(() => {
        const groups = {};

        products.forEach((product) => {
            let key = "Other";

            if (type === "brand") {
                key = product?.tags?.[0]?.name || "Other";
            } else {
                key = product?.brand?.name || "Other";
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(product);
        });

        return Object.entries(groups);
    }, [products, type]);

    if (loading) {
        return (
            <div className="flex flex-col items-center py-12">
                <ClipLoader color="#0047ff" size={50} />
                <div className="mt-3 text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-600 py-10">{error}</div>;
    }

    return (
        <div>
            <div className="text-xl text-blue-900 text-center font-bold py-2">
                {listType}
            </div>

            {groupedProducts.map(([group, items], i) => (
                <div key={i} className="mb-10 mt-6">
                    <h2 className="text-xl font-semibold text-blue-800">{group}</h2>
                    <div className="h-[3px] bg-blue-800 mb-4" />

                    <div className="space-y-4">
                        {items.map((product) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="block"
                            >
                                <div className="flex gap-4 border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition relative">

                                    {/* IMAGE */}
                                    <div className="w-[110px] h-[140px] bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                                        {product?.image?.url ? (
                                            <Image
                                                src={getImageUrl(product.image.url)}
                                                alt={product.name}
                                                width={200}
                                                height={300}
                                                className="object-contain w-full h-full"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs">
                                                No Image
                                            </span>
                                        )}
                                    </div>

                                    {/* TEXT */}
                                    <div className="flex-1">
                                        <h3 className="text-blue-900 font-semibold text-sm sm:text-base">
                                            {product.name}
                                        </h3>

                                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {product.details}
                                        </div>

                                        <div className="text-green-600 font-semibold mt-2">
                                            Rs. {product.price}
                                        </div>
                                    </div>

                                    {/* COPY BUTTON */}
                                    <div className="absolute bottom-2 right-2">
                                        <button
                                            onClick={(e) => handleCopy(e, product.slug)}
                                            className="flex items-center gap-1 bg-white text-gray-700 text-[11px] px-2 py-1 rounded shadow"
                                        >
                                            {copiedSlug === product.slug ? (
                                                <>
                                                    <FiCheck
                                                        size={12}
                                                        className="text-green-600"
                                                    />
                                                    <span className="text-green-600">
                                                        Copied
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiCopy size={12} />
                                                    Copy URL
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductListClient;