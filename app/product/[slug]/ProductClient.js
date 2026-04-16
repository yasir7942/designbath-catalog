"use client";

import { use, useEffect, useMemo, useState } from "react";
import { getSingleProduct } from "../../data/loader";
import { ClipLoader, RiseLoader } from "react-spinners";
import Image from "next/image";
import { getImageUrl } from "../../libs/helpers";
import { FaWhatsapp } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923246669988";

const ProductClient = ({ params }) => {
    const { slug } = use(params);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imgLoading, setImgLoading] = useState(true);
    const [waLoading, setWaLoading] = useState(false);

    useEffect(() => {
        let ignore = false;

        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const productData = await getSingleProduct(slug);
                const fetchedProduct = productData?.data?.[0] || null;

                if (!ignore) {
                    if (!fetchedProduct) {
                        setError("Product not found.");
                        setProduct(null);
                    } else {
                        setProduct(fetchedProduct);
                        setImgLoading(true);
                    }
                }
            } catch (err) {
                console.error("SingleProduct Error:", err);

                if (!ignore) {
                    setError(err.message || "Failed to fetch product.");
                    setProduct(null);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            ignore = true;
        };
    }, [slug]);

    const discountedPrice = useMemo(() => {
        if (!product) return 0;

        let value = 0;

        if (
            product.useBrandDiscount &&
            product?.brand?.discount !== null &&
            product?.brand?.discount !== ""
        ) {
            const discount = Number(product.brand.discount) / 100;
            value = (Number(product.price) - Number(product.price) * discount) | 0;
        } else if (
            !product.useBrandDiscount &&
            product.salePrice !== null &&
            product.salePrice !== ""
        ) {
            if (product.IsFixValueDiscount) {
                value = Number(product.price) - Number(product.salePrice);
            } else {
                const percentageDiscount = Number(product.salePrice) / 100;
                value =
                    (Number(product.price) - Number(product.price) * percentageDiscount) |
                    0;
            }
        }

        return value;
    }, [product]);

    const categoryNames = useMemo(() => {
        if (!Array.isArray(product?.tags)) return [];
        return product.tags
            .map((tag) => String(tag?.name || "").trim())
            .filter(Boolean);
    }, [product]);

    const jsonLd = useMemo(() => {
        if (!product) return null;

        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: [
                product?.image?.formats?.thumbnail?.url || product?.image?.url || "",
                product?.image?.formats?.thumbnail?.url || product?.image?.url || "",
            ],
            description: product.details || "",
            brand: {
                "@type": "Brand",
                name: product?.brand?.name || "",
            },
            offers: {
                "@type": "Offer",
                priceCurrency: "PKR",
                price: product.price || 0,
                lowPrice: discountedPrice,
                highPrice: product.price || 0,
                priceValidUntil: "2030-10-10",
                itemCondition: "https://schema.org/NewCondition",
                availability: "http://schema.org/InStock",
                seller: {
                    "@type": "Organization",
                    name: "Design Bath Walton Road Lahore",
                },
            },
        };
    }, [product, discountedPrice]);

    const getCityFromCoordinates = async (latitude, longitude) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                    cache: "no-store",
                }
            );

            if (!res.ok) throw new Error("Reverse geocoding failed");

            const data = await res.json();
            const address = data?.address || {};

            return (
                address.city ||
                address.town ||
                address.county ||
                address.state_district ||
                address.state ||
                ""
            );
        } catch (err) {
            console.error("Nominatim reverse error:", err);
            return "";
        }
    };

    const getCityFromIp = async () => {
        try {
            const res = await fetch("https://ipapi.co/json/", {
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            if (!res.ok) throw new Error("IP lookup failed");

            const data = await res.json();
            return data?.city || data?.region || data?.country_name || "";
        } catch (err) {
            console.error("IP lookup error:", err);
            return "";
        }
    };

    const getCustomerCity = async () => {
        const isSecure =
            typeof window !== "undefined" && window.isSecureContext === true;

        if (
            isSecure &&
            typeof navigator !== "undefined" &&
            navigator.geolocation
        ) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 7000,
                        maximumAge: 300000,
                    });
                });

                const gpsCity = await getCityFromCoordinates(
                    position.coords.latitude,
                    position.coords.longitude
                );

                if (gpsCity) return gpsCity;
            } catch (err) {
                console.warn("GPS location not available, falling back to IP:", err);
            }
        }

        return await getCityFromIp();
    };

    const handleWhatsAppClick = async () => {
        if (!product) return;

        const popup = window.open("about:blank", "_blank");
        setWaLoading(true);

        try {
            const city = await getCustomerCity();

            const message = encodeURIComponent(
                `${window.location.href}
Product: ${product.name}
${city ? `Customer City: ${city}` : ""}`
            );

            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

            if (popup) {
                popup.location.href = waUrl;
            } else {
                window.open(waUrl, "_blank");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setWaLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <ClipLoader color="#0047ff" size={50} speedMultiplier={1} />
                <div className="mt-3 text-gray-600 font-medium">Loading product...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-600 font-semibold">
                {error}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-10 text-gray-500">
                No product found.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {jsonLd ? (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="w-full">
                    <div className="relative w-full max-w-[420px] sm:max-w-[480px] md:max-w-[560px] mx-auto bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        <div className="relative w-full aspect-[5/5] flex items-center justify-center">
                            {imgLoading && product.image?.url && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <RiseLoader color="#0047ff" size={10} margin={4} />
                                </div>
                            )}

                            {product.image?.url ? (
                                <Image
                                    src={getImageUrl(product.image.url)}
                                    alt={product.name}
                                    width={1200}
                                    height={1600}
                                    className={`w-full h-full object-contain transition-opacity duration-500 ${imgLoading ? "opacity-0" : "opacity-100"
                                        }`}
                                    onLoadingComplete={() => setImgLoading(false)}
                                    draggable={false}
                                    priority={false}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                        {product.name}
                    </h1>

                    <div className="space-y-2">
                        <div className="text-gray-700 text-base sm:text-lg">
                            <strong>Price:</strong>{" "}
                            <span
                                className={
                                    discountedPrice > 0 ? "line-through text-gray-400" : ""
                                }
                            >
                                {product.price}/-
                            </span>
                        </div>

                        {discountedPrice > 0 && (
                            <div className="text-green-600 font-semibold text-base sm:text-lg">
                                Discounted Price: {discountedPrice}/-
                            </div>
                        )}
                    </div>

                    {(product?.brand?.name || categoryNames.length > 0) && (
                        <div className="space-y-1 text-sm sm:text-base text-gray-700">
                            {product?.brand?.name ? (
                                <div>
                                    <strong>Brand:</strong> {product.brand.name}
                                </div>
                            ) : null}

                            {categoryNames.length > 0 ? (
                                <div>
                                    <strong>Category:</strong> {categoryNames.join(", ")}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {product?.details ? (
                        <div className="text-sm sm:text-base text-gray-600 leading-7 whitespace-pre-line">
                            {product.details}
                        </div>
                    ) : null}

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleWhatsAppClick}
                            disabled={waLoading}
                            className="inline-flex items-center justify-center gap-3 rounded-md bg-green-600 px-5 py-3 text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 min-w-[180px]"
                        >
                            {waLoading ? (
                                <>
                                    <AiOutlineLoading3Quarters
                                        size={20}
                                        className="animate-spin"
                                    />
                                    <span className="font-medium">Please wait...</span>
                                </>
                            ) : (
                                <>
                                    <FaWhatsapp size={22} />
                                    <span className="font-medium">WhatsApp me</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="px-4 py-3 text-[12px] text-red-600">
                        *Prices are subject to change due to market and economic conditions.
                        Please confirm the latest price with us on WhatsApp.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductClient;