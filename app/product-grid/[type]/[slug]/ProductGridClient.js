"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
    getProudctListByBrand,
    getProudctListByFilter,
} from "../../../data/loader";
import ProductGridBlock from "../../../components/layout/ProductGridBlock";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { FiCopy, FiCheck } from "react-icons/fi";

const ProductGridClient = ({ params }) => {
    const { type, slug } = use(params);

    const [products, setProducts] = useState([]);
    const [listType, setListType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedSlug, setCopiedSlug] = useState(null);

    const url = (process.env.NEXT_PUBLIC_BASE_URL || "") + "/product/";

    // ✅ COPY FUNCTION
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
                setError("");

                let fetchedProducts = [];
                let fetchedListType = "";

                if (type === "brand") {
                    fetchedProducts = await getProudctListByBrand(slug);
                    fetchedListType =
                        fetchedProducts?.[0]?.brand?.name || "";
                } else if (type === "filter") {
                    fetchedProducts = await getProudctListByFilter(slug);

                    const currentTag =
                        fetchedProducts?.find((item) =>
                            Array.isArray(item?.tags)
                                ? item.tags.some((tag) => tag?.slug === slug)
                                : false
                        )?.tags?.find((tag) => tag?.slug === slug)?.name ||
                        fetchedProducts?.[0]?.tags?.[0]?.name ||
                        "";

                    fetchedListType = currentTag;
                } else {
                    throw new Error("Invalid type.");
                }

                if (!ignore) {
                    setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
                    setListType(fetchedListType);
                }
            } catch (err) {
                console.error(err);

                if (!ignore) {
                    setError(err.message || "Failed to fetch products.");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadProducts();

        return () => {
            ignore = true;
        };
    }, [type, slug]);

    // ✅ GROUPING
    const groupedProducts = useMemo(() => {
        const groups = {};

        products.forEach((product) => {
            let groupKey = "Other";
            let hasRealGroup = false;

            if (type === "brand") {
                if (product?.tags?.length) {
                    groupKey = product.tags[0]?.name || "Other";
                    hasRealGroup = true;
                }
            } else {
                if (product?.brand?.name) {
                    groupKey = product.brand.name;
                    hasRealGroup = true;
                }
            }

            if (!groups[groupKey]) {
                groups[groupKey] = { title: groupKey, hasRealGroup, items: [] };
            }

            groups[groupKey].items.push(product);
        });

        return Object.values(groups);
    }, [products, type]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <ClipLoader color="#0047ff" size={50} />
                <div className="mt-3 text-gray-600">Loading products...</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    return (
        <div>
            <div className="text-xl text-blue-900 text-center font-bold py-2">
                {listType}
            </div>

            {groupedProducts.map((group, i) => (
                <div key={i} className="mb-10">
                    <h2 className="text-xl font-semibold text-blue-800">
                        {group.title}
                    </h2>
                    <div className="h-[3px] bg-blue-800 mb-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {group.items.map((product, index) => (
                            <div key={product.id || index} className="relative group">
                                <Link href={url + product.slug}>
                                    <ProductGridBlock product={product} />
                                </Link>

                                {/* ✅ COPY BUTTON */}
                                <div className="absolute bottom-2 right-2">
                                    <button
                                        onClick={(e) => handleCopy(e, product.slug)}
                                        className="flex items-center gap-1 bg-white/90 hover:bg-white text-gray-700 text-[11px] px-2 py-1 rounded shadow transition"
                                    >
                                        {copiedSlug === product.slug ? (
                                            <>
                                                <FiCheck size={12} className="text-green-600" />
                                                <span className="text-green-600">Copied</span>
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
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGridClient;