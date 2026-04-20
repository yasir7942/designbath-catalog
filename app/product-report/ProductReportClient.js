"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { FiSearch, FiCheckCircle, FiLogIn, FiX } from "react-icons/fi";
import { getImageUrl } from "../libs/helpers";
import { getAllProductsReport } from "../data/loader";

const STRAPI_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-PK", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getDiscountedPrice(product) {
    if (!product) return 0;

    let value = 0;

    if (
        product.useBrandDiscount &&
        product?.brand?.discount !== null &&
        product?.brand?.discount !== undefined &&
        product?.brand?.discount !== ""
    ) {
        const discount = Number(product.brand.discount) / 100;
        value = (Number(product.price) - Number(product.price) * discount) | 0;
    } else if (
        !product.useBrandDiscount &&
        product?.salePrice !== null &&
        product?.salePrice !== undefined &&
        product?.salePrice !== ""
    ) {
        if (product?.IsFixValueDiscount) {
            value = Number(product.price) - Number(product.salePrice);
        } else {
            const percentageDiscount = Number(product.salePrice) / 100;
            value =
                (Number(product.price) - Number(product.price) * percentageDiscount) | 0;
        }
    }

    return value;
}

const LOGGED_IN_GRID =
    // "70px 250px 110px 200px 90px 90px 110px 110px 110px 200px 60px";
    "5% 17.86% 7% 14% 6% 6% 5% 7% 7% 10% 4%";

const LOGGED_OUT_GRID =
    // "56px 240px 130px 180px 110px 120px";
    "6.70% 28.71% 15% 21% 13% 14%";

const ProductReportClient = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [hoveredImage, setHoveredImage] = useState(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginForm, setLoginForm] = useState({
        identifier: "",
        password: "",
    });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [editedPrices, setEditedPrices] = useState({});
    const [editedStock, setEditedStock] = useState({});
    const [savingMap, setSavingMap] = useState({});
    const [savedMap, setSavedMap] = useState({});

    useEffect(() => {
        let ignore = false;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getAllProductsReport();

                if (!ignore) {
                    const rows = Array.isArray(result) ? result : [];
                    setProducts(rows);

                    const initialPrices = {};
                    const initialStock = {};

                    rows.forEach((product) => {
                        const key = product.documentId || product.id;

                        initialPrices[key] =
                            product?.price !== null &&
                                product?.price !== undefined &&
                                product?.price !== ""
                                ? String(product.price)
                                : "";

                        initialStock[key] =
                            product?.stock !== null &&
                                product?.stock !== undefined &&
                                product?.stock !== ""
                                ? String(product.stock)
                                : "";
                    });

                    setEditedPrices(initialPrices);
                    setEditedStock(initialStock);
                }
            } catch (err) {
                console.error("ProductReport Error:", err);

                if (!ignore) {
                    setError(err.message || "Failed to load product report.");
                    setProducts([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        const savedJwt =
            typeof window !== "undefined"
                ? sessionStorage.getItem("product_report_jwt")
                : null;

        if (savedJwt) {
            setIsLoggedIn(true);
        }

        loadProducts();

        return () => {
            ignore = true;
        };
    }, []);

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return products;

        return products.filter((product) => {
            const productName = String(product?.name || "").toLowerCase();
            const brandName = String(product?.brand?.name || "").toLowerCase();
            const model = String(product?.model || "").toLowerCase();
            const slug = String(product?.slug || "").toLowerCase();
            const stock = String(product?.stock ?? "").toLowerCase();
            const price = String(product?.price ?? "").toLowerCase();
            const salePrice = String(product?.salePrice ?? "").toLowerCase();
            const tagText = Array.isArray(product?.tags)
                ? product.tags
                    .map((tag) => String(tag?.name || ""))
                    .join(" ")
                    .toLowerCase()
                : "";

            return (
                productName.includes(q) ||
                brandName.includes(q) ||
                slug.includes(q) ||
                model.includes(q) ||
                stock.includes(q) ||
                price.includes(q) ||
                salePrice.includes(q) ||
                tagText.includes(q)
            );
        });
    }, [products, search]);

    const groupedData = useMemo(() => {
        const groups = {};

        filteredProducts.forEach((product) => {
            const brandName =
                String(product?.brand?.name || "Other Brand").trim() || "Other Brand";

            if (!groups[brandName]) {
                groups[brandName] = {};
            }

            const tagNames =
                Array.isArray(product?.tags) && product.tags.length > 0
                    ? product.tags
                        .map((tag) => String(tag?.name || "").trim())
                        .filter(Boolean)
                    : ["Other"];

            const uniqueTagNames = [...new Set(tagNames)];

            uniqueTagNames.forEach((tagName) => {
                const finalTag = tagName || "Other";

                if (!groups[brandName][finalTag]) {
                    groups[brandName][finalTag] = [];
                }

                groups[brandName][finalTag].push(product);
            });
        });

        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([brandName, tagGroup]) => ({
                brandName,
                tags: Object.entries(tagGroup)
                    .sort((a, b) => {
                        if (a[0] === "Other") return 1;
                        if (b[0] === "Other") return -1;
                        return a[0].localeCompare(b[0]);
                    })
                    .map(([tagName, items]) => ({
                        tagName,
                        items: items.sort((a, b) =>
                            String(a?.name || "").localeCompare(String(b?.name || ""))
                        ),
                    })),
            }));
    }, [filteredProducts]);

    const brandTagIndex = useMemo(() => {
        return groupedData.map((brandGroup) => ({
            brandName: brandGroup.brandName,
            tagNames: brandGroup.tags.map((t) => t.tagName),
        }));
    }, [groupedData]);

    const totalProducts = filteredProducts.length;

    const openLogin = () => {
        setLoginError("");
        setShowLoginModal(true);
    };

    const closeLogin = () => {
        setShowLoginModal(false);
        setLoginError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!loginForm.identifier.trim() || !loginForm.password.trim()) {
            setLoginError("Please enter your email/username and password.");
            return;
        }

        try {
            setLoginLoading(true);
            setLoginError("");

            const res = await fetch(`${STRAPI_BASE}auth/local`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: loginForm.identifier.trim(),
                    password: loginForm.password,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.jwt) {
                throw new Error(data?.error?.message || "Login failed.");
            }

            sessionStorage.setItem("product_report_jwt", data.jwt);
            setIsLoggedIn(true);
            setShowLoginModal(false);
            setLoginForm({ identifier: "", password: "" });
        } catch (err) {
            console.error("Login error:", err);
            setLoginError(err.message || "Unable to login.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("product_report_jwt");
        setIsLoggedIn(false);
    };

    const handlePriceChange = (productKey, value) => {
        setEditedPrices((prev) => ({
            ...prev,
            [productKey]: value,
        }));

        setSavedMap((prev) => ({
            ...prev,
            [productKey]: false,
        }));
    };

    const handleStockChange = (productKey, value) => {
        setEditedStock((prev) => ({
            ...prev,
            [productKey]: value,
        }));

        setSavedMap((prev) => ({
            ...prev,
            [productKey]: false,
        }));
    };

    const showSavedTick = (productKey) => {
        setSavedMap((prev) => ({
            ...prev,
            [productKey]: true,
        }));

        setTimeout(() => {
            setSavedMap((prev) => ({
                ...prev,
                [productKey]: false,
            }));
        }, 10000);
    };

    const savePrice = async (product) => {
        const productKey = product.documentId || product.id;
        const rawValue = editedPrices[productKey];

        if (rawValue === undefined) return;
        if (String(rawValue).trim() === String(product?.price ?? "").trim()) return;

        const numericPrice = Number(rawValue);
        if (rawValue === "" || Number.isNaN(numericPrice)) return;

        try {
            setSavingMap((prev) => ({ ...prev, [productKey]: true }));

            const res = await fetch("/api/product/updatePrice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId: product.documentId,
                    price: numericPrice,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.ok) {
                throw new Error(data?.error || "Failed to update price.");
            }

            const updatedAt =
                data?.updatedAt ||
                data?.product?.updatedAt ||
                new Date().toISOString();

            setProducts((prev) =>
                prev.map((item) => {
                    if ((item.documentId || item.id) !== productKey) return item;

                    return {
                        ...item,
                        price: numericPrice,
                        updatedAt,
                    };
                })
            );

            setEditedPrices((prev) => ({
                ...prev,
                [productKey]: String(numericPrice),
            }));

            showSavedTick(productKey);
        } catch (err) {
            console.error("Save price error:", err);
            alert(err.message || "Failed to update price.");
        } finally {
            setSavingMap((prev) => ({ ...prev, [productKey]: false }));
        }
    };

    const saveStock = async (product) => {
        const productKey = product.documentId || product.id;
        const rawValue = editedStock[productKey];

        if (rawValue === undefined) return;
        if (String(rawValue).trim() === String(product?.stock ?? "").trim()) return;

        const numericStock = Number(rawValue);
        if (rawValue === "" || Number.isNaN(numericStock)) return;

        try {
            setSavingMap((prev) => ({ ...prev, [productKey]: true }));

            const res = await fetch("/api/product/updatePrice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId: product.documentId,
                    stock: numericStock,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data?.ok) {
                throw new Error(data?.error || "Failed to update stock.");
            }

            const updatedAt =
                data?.updatedAt ||
                data?.product?.updatedAt ||
                new Date().toISOString();

            setProducts((prev) =>
                prev.map((item) => {
                    if ((item.documentId || item.id) !== productKey) return item;

                    return {
                        ...item,
                        stock: numericStock,
                        updatedAt,
                    };
                })
            );

            setEditedStock((prev) => ({
                ...prev,
                [productKey]: String(numericStock),
            }));

            showSavedTick(productKey);
        } catch (err) {
            console.error("Save stock error:", err);
            alert(err.message || "Failed to update stock.");
        } finally {
            setSavingMap((prev) => ({ ...prev, [productKey]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <ClipLoader color="#0047ff" size={44} speedMultiplier={1} />
                <div className="mt-2 text-base text-gray-600">
                    Loading product report...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-4 text-center text-base text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="relative">
            {hoveredImage ? (
                <div className="pointer-events-none fixed right-4 top-24 z-[9999] hidden w-[280px] rounded-lg border border-slate-300 bg-white p-2 shadow-2xl xl:block">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-gray-100">
                        <Image
                            src={hoveredImage.src}
                            alt={hoveredImage.alt}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs font-medium text-slate-700">
                        {hoveredImage.alt}
                    </div>
                </div>
            ) : null}

            <div className="sticky top-0 z-40 mb-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-blue-900">Product Report</h1>
                        <div className="text-xs text-slate-500">
                            All products on one page • grouped by brand and category • {totalProducts} items
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
                        <div className="relative w-full lg:w-[700px]">
                            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search product, brand, tag, slug, stock..."
                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {isLoggedIn ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Logged In
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={openLogin}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800"
                            >
                                <FiLogIn size={16} />
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="sticky top-[80px] z-30 mb-4 rounded-xl border border-slate-200 bg-slate-50/95 px-3 py-3 backdrop-blur">
                <div className="max-h-[170px] overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                        {brandTagIndex.map((brand) => (
                            <div
                                key={brand.brandName}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1.5"
                            >
                                <a
                                    href={`#brand-${encodeURIComponent(brand.brandName)}`}
                                    className="block text-xs font-semibold text-blue-900 hover:underline"
                                >
                                    {brand.brandName}
                                </a>

                                <div className="mt-1 flex max-w-[280px] flex-wrap gap-1">
                                    {brand.tagNames.map((tagName) => (
                                        <a
                                            key={`${brand.brandName}-${tagName}`}
                                            href={`#tag-${encodeURIComponent(
                                                brand.brandName
                                            )}-${encodeURIComponent(tagName)}`}
                                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                                        >
                                            {tagName}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {groupedData.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-base text-slate-500">
                    No matching products found.
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedData.map((brandGroup) => (
                        <section
                            key={brandGroup.brandName}
                            id={`brand-${encodeURIComponent(brandGroup.brandName)}`}
                            className="scroll-mt-[150px]"
                        >
                            <div className="mb-2 border-b-2 border-blue-800 pb-1">
                                <h2 className="text-xl font-semibold text-blue-900">
                                    {brandGroup.brandName}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {brandGroup.tags.map((tagGroup) => (
                                    <div
                                        key={`${brandGroup.brandName}-${tagGroup.tagName}`}
                                        id={`tag-${encodeURIComponent(
                                            brandGroup.brandName
                                        )}-${encodeURIComponent(tagGroup.tagName)}`}
                                        className="scroll-mt-[160px]"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="text-base font-semibold text-blue-800">
                                                {tagGroup.tagName}
                                            </h3>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                                {tagGroup.items.length}
                                            </span>
                                        </div>

                                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                            {isLoggedIn ? (
                                                <>
                                                    <div
                                                        className="hidden gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 lg:grid overflow-scroll"
                                                        style={{ gridTemplateColumns: LOGGED_IN_GRID }}
                                                    >
                                                        <div>Image</div>
                                                        <div>Product</div>
                                                        <div>Brand</div>
                                                        <div>Tags</div>
                                                        <div>List Price</div>
                                                        <div>Fix Dis. Amt</div>
                                                        <div>Brand Discount</div>
                                                        <div>Discount Price</div>
                                                        <div>Stock</div>
                                                        <div>Updated</div>
                                                        <div>Saved</div>
                                                    </div>

                                                    <div className="divide-y divide-slate-200">
                                                        {tagGroup.items.map((product) => {
                                                            const productKey = product.documentId || product.id;
                                                            const discountedPrice = getDiscountedPrice(product);
                                                            const tagText =
                                                                Array.isArray(product?.tags) &&
                                                                    product.tags.length > 0
                                                                    ? product.tags
                                                                        .map((tag) =>
                                                                            String(tag?.name || "").trim()
                                                                        )
                                                                        .filter(Boolean)
                                                                        .join(", ")
                                                                    : "—";

                                                            const salePriceText =
                                                                product?.salePrice !== null &&
                                                                    product?.salePrice !== undefined &&
                                                                    product?.salePrice !== ""
                                                                    ? product.salePrice
                                                                    : "—";

                                                            const imageSrc = product?.image?.url
                                                                ? getImageUrl(product.image.url)
                                                                : null;

                                                            return (
                                                                <div
                                                                    key={productKey}
                                                                    className="px-3 py-3 text-sm transition hover:bg-slate-50"
                                                                >
                                                                    <div
                                                                        className="hidden items-center gap-3 lg:grid"
                                                                        style={{
                                                                            gridTemplateColumns: LOGGED_IN_GRID,
                                                                        }}
                                                                    >
                                                                        <div className="flex h-[58px] w-[46px] items-center justify-center overflow-hidden rounded bg-gray-100">
                                                                            {imageSrc ? (
                                                                                <Image
                                                                                    src={imageSrc}
                                                                                    alt={product?.name || "Product"}
                                                                                    width={92}
                                                                                    height={116}
                                                                                    className="h-full w-full cursor-zoom-in object-contain"
                                                                                    onMouseEnter={() =>
                                                                                        setHoveredImage({
                                                                                            src: imageSrc,
                                                                                            alt:
                                                                                                product?.name ||
                                                                                                "Product",
                                                                                        })
                                                                                    }
                                                                                    onMouseLeave={() =>
                                                                                        setHoveredImage(null)
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <span className="text-[10px] text-slate-400">
                                                                                    No
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <div className="line-clamp-2 leading-5 font-medium text-slate-900">
                                                                                {product?.name ||
                                                                                    "Untitled Product"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="truncate text-xs text-slate-700">
                                                                            {product?.brand?.name || "—"}
                                                                        </div>

                                                                        <div className="line-clamp-2 text-xs leading-4 text-slate-700">
                                                                            {tagText}
                                                                        </div>

                                                                        <div>
                                                                            <input
                                                                                type="number"
                                                                                step="any"
                                                                                value={
                                                                                    editedPrices[productKey] ?? ""
                                                                                }
                                                                                onChange={(e) =>
                                                                                    handlePriceChange(
                                                                                        productKey,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                onBlur={() => savePrice(product)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        e.currentTarget.blur();
                                                                                    }
                                                                                }}
                                                                                disabled={savingMap[productKey]}
                                                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                            />
                                                                        </div>

                                                                        <div className="text-sm font-medium text-green-700">
                                                                            {salePriceText}
                                                                        </div>

                                                                        <div className="text-xs text-slate-700">
                                                                            {product?.useBrandDiscount === true &&
                                                                                product?.brand?.discount !== null &&
                                                                                product?.brand?.discount !== undefined
                                                                                ? `${product.brand.discount}%`
                                                                                : "No"}
                                                                        </div>

                                                                        <div className="text-sm text-slate-700">
                                                                            {discountedPrice > 0
                                                                                ? `${discountedPrice}/-`
                                                                                : "--"}
                                                                        </div>

                                                                        <div>
                                                                            <input
                                                                                type="number"
                                                                                step="any"
                                                                                value={
                                                                                    editedStock[productKey] ?? ""
                                                                                }
                                                                                placeholder="0"
                                                                                onChange={(e) =>
                                                                                    handleStockChange(
                                                                                        productKey,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                onBlur={() => saveStock(product)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        e.currentTarget.blur();
                                                                                    }
                                                                                }}
                                                                                disabled={savingMap[productKey]}
                                                                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                            />
                                                                        </div>

                                                                        <div className="text-xs leading-4 text-slate-700">
                                                                            {formatDateTime(product?.updatedAt)}
                                                                        </div>

                                                                        <div className="flex justify-center">
                                                                            {savingMap[productKey] ? (
                                                                                <span className="text-xs text-slate-500">
                                                                                    Saving...
                                                                                </span>
                                                                            ) : savedMap[productKey] ? (
                                                                                <FiCheckCircle
                                                                                    size={18}
                                                                                    className="text-green-600"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-slate-300">
                                                                                    —
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="lg:hidden">
                                                                        <div className="flex gap-3">
                                                                            <div className="flex h-[74px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                                                                                {imageSrc ? (
                                                                                    <Image
                                                                                        src={imageSrc}
                                                                                        alt={
                                                                                            product?.name || "Product"
                                                                                        }
                                                                                        width={92}
                                                                                        height={116}
                                                                                        className="h-full w-full object-contain"
                                                                                    />
                                                                                ) : (
                                                                                    <span className="text-[10px] text-slate-400">
                                                                                        No Image
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="truncate text-sm font-semibold text-slate-900">
                                                                                    {product?.name ||
                                                                                        "Untitled Product"}
                                                                                </div>

                                                                                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                                                                    <div>
                                                                                        <span className="font-medium text-slate-500">
                                                                                            Stock:
                                                                                        </span>{" "}
                                                                                        <span className="text-slate-800">
                                                                                            {product?.stock ?? "—"}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span className="font-medium text-slate-500">
                                                                                            Price:
                                                                                        </span>{" "}
                                                                                        <span className="text-slate-800">
                                                                                            {product?.price ?? "—"}
                                                                                        </span>
                                                                                    </div>

                                                                                    {discountedPrice > 0 && (
                                                                                        <div>
                                                                                            <span className="text-slate-700 font-semibold">
                                                                                                Discount Price:
                                                                                            </span>{" "}
                                                                                            <span className="text-slate-900 font-semibold">
                                                                                                {discountedPrice}/-
                                                                                            </span>
                                                                                        </div>
                                                                                    )}

                                                                                    <div>
                                                                                        <span className="font-medium text-slate-500">
                                                                                            Brand:
                                                                                        </span>{" "}
                                                                                        <span className="text-slate-800">
                                                                                            {product?.brand?.name || "—"}
                                                                                        </span>
                                                                                    </div>

                                                                                    <div>
                                                                                        <span className="font-medium text-slate-500">
                                                                                            Fix/% Dis. Amt:
                                                                                        </span>{" "}
                                                                                        <span className="text-green-700">
                                                                                            {salePriceText}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mt-1 line-clamp-2 text-xs text-slate-700">
                                                                                    <span className="font-medium text-slate-500">
                                                                                        Tags:
                                                                                    </span>{" "}
                                                                                    {tagText}
                                                                                </div>

                                                                                <div className="mt-1 text-xs text-slate-700">
                                                                                    <span className="font-medium text-slate-500">
                                                                                        Updated:
                                                                                    </span>{" "}
                                                                                    {formatDateTime(product?.updatedAt)}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-3 flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                step="any"
                                                                                value={
                                                                                    editedPrices[productKey] ?? ""
                                                                                }
                                                                                onChange={(e) =>
                                                                                    handlePriceChange(
                                                                                        productKey,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                onBlur={() => savePrice(product)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        e.currentTarget.blur();
                                                                                    }
                                                                                }}
                                                                                disabled={savingMap[productKey]}
                                                                                className="w-full rounded border border-slate-300 px-2 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                                placeholder="Price"
                                                                            />

                                                                            <div className="w-[28px] text-center">
                                                                                {savingMap[productKey] ? (
                                                                                    <span className="text-xs text-slate-500">
                                                                                        ...
                                                                                    </span>
                                                                                ) : savedMap[productKey] ? (
                                                                                    <FiCheckCircle
                                                                                        size={18}
                                                                                        className="mx-auto text-green-600"
                                                                                    />
                                                                                ) : null}
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-3 flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                step="any"
                                                                                value={
                                                                                    editedStock[productKey] ?? ""
                                                                                }
                                                                                onChange={(e) =>
                                                                                    handleStockChange(
                                                                                        productKey,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                onBlur={() => saveStock(product)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === "Enter") {
                                                                                        e.currentTarget.blur();
                                                                                    }
                                                                                }}
                                                                                disabled={savingMap[productKey]}
                                                                                className="w-full rounded border border-slate-300 px-2 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                                placeholder="Stock"
                                                                            />

                                                                            <div className="w-[28px] text-center">
                                                                                {savingMap[productKey] ? (
                                                                                    <span className="text-xs text-slate-500">
                                                                                        ...
                                                                                    </span>
                                                                                ) : savedMap[productKey] ? (
                                                                                    <FiCheckCircle
                                                                                        size={18}
                                                                                        className="mx-auto text-green-600"
                                                                                    />
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="hidden gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 lg:grid"
                                                        style={{ gridTemplateColumns: LOGGED_OUT_GRID }}
                                                    >
                                                        <div>Image</div>
                                                        <div>Product</div>
                                                        <div>Brand</div>
                                                        <div>Tags</div>
                                                        <div>Price</div>
                                                        <div>Discount Price</div>
                                                    </div>

                                                    <div className="divide-y divide-slate-200">
                                                        {tagGroup.items.map((product) => {
                                                            const productKey = product.documentId || product.id;
                                                            const discountedPrice = getDiscountedPrice(product);
                                                            const tagText =
                                                                Array.isArray(product?.tags) &&
                                                                    product.tags.length > 0
                                                                    ? product.tags
                                                                        .map((tag) =>
                                                                            String(tag?.name || "").trim()
                                                                        )
                                                                        .filter(Boolean)
                                                                        .join(", ")
                                                                    : "—";

                                                            const imageSrc = product?.image?.url
                                                                ? getImageUrl(product.image.url)
                                                                : null;

                                                            return (
                                                                <div
                                                                    key={productKey}
                                                                    className="px-3 py-3 text-sm transition hover:bg-slate-50"
                                                                >
                                                                    <div
                                                                        className="hidden items-center gap-3 lg:grid"
                                                                        style={{
                                                                            gridTemplateColumns: LOGGED_OUT_GRID,
                                                                        }}
                                                                    >
                                                                        <div className="flex h-[58px] w-[46px] items-center justify-center overflow-hidden rounded bg-gray-100">
                                                                            {imageSrc ? (
                                                                                <Image
                                                                                    src={imageSrc}
                                                                                    alt={product?.name || "Product"}
                                                                                    width={92}
                                                                                    height={116}
                                                                                    className="h-full w-full cursor-zoom-in object-contain"
                                                                                    onMouseEnter={() =>
                                                                                        setHoveredImage({
                                                                                            src: imageSrc,
                                                                                            alt:
                                                                                                product?.name ||
                                                                                                "Product",
                                                                                        })
                                                                                    }
                                                                                    onMouseLeave={() =>
                                                                                        setHoveredImage(null)
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <span className="text-[10px] text-slate-400">
                                                                                    No
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <div className="line-clamp-2 leading-5 font-medium text-slate-900">
                                                                                {product?.name ||
                                                                                    "Untitled Product"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="truncate text-xs text-slate-700">
                                                                            {product?.brand?.name || "—"}
                                                                        </div>

                                                                        <div className="line-clamp-2 text-xs leading-4 text-slate-700">
                                                                            {tagText}
                                                                        </div>

                                                                        <div className="font-medium text-slate-800">
                                                                            {product?.price ?? "—"}
                                                                        </div>

                                                                        <div className="text-sm text-slate-700">
                                                                            {discountedPrice > 0
                                                                                ? `${discountedPrice}/-`
                                                                                : `${product?.price ?? "—"}/-`}
                                                                        </div>
                                                                    </div>

                                                                    <div className="lg:hidden">
                                                                        <div className="flex gap-3">
                                                                            <div className="flex h-[74px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                                                                                {imageSrc ? (
                                                                                    <Image
                                                                                        src={imageSrc}
                                                                                        alt={
                                                                                            product?.name || "Product"
                                                                                        }
                                                                                        width={92}
                                                                                        height={116}
                                                                                        className="h-full w-full object-contain"
                                                                                    />
                                                                                ) : (
                                                                                    <span className="text-[10px] text-slate-400">
                                                                                        No Image
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="truncate text-sm font-semibold text-slate-900">
                                                                                    {product?.name ||
                                                                                        "Untitled Product"}
                                                                                </div>

                                                                                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                                                                    <div>
                                                                                        <span className="font-medium text-slate-500">
                                                                                            Price:
                                                                                        </span>{" "}
                                                                                        <span className="text-slate-800">
                                                                                            {product?.price ?? "—"}
                                                                                        </span>
                                                                                    </div>

                                                                                    {discountedPrice > 0 && (
                                                                                        <div>
                                                                                            <span className="text-slate-700 font-semibold">
                                                                                                Discount Price:
                                                                                            </span>{" "}
                                                                                            <span className="text-slate-900 font-semibold">
                                                                                                {discountedPrice}/-
                                                                                            </span>
                                                                                        </div>
                                                                                    )}

                                                                                    <div>
                                                                                        <span className="font-medium text-slate-500">
                                                                                            Brand:
                                                                                        </span>{" "}
                                                                                        <span className="text-slate-800">
                                                                                            {product?.brand?.name || "—"}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mt-1 line-clamp-2 text-xs text-slate-700">
                                                                                    <span className="font-medium text-slate-500">
                                                                                        Tags:
                                                                                    </span>{" "}
                                                                                    {tagText}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {showLoginModal ? (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-blue-900">
                                Login to Edit Prices / Stock
                            </h2>
                            <button
                                type="button"
                                onClick={closeLogin}
                                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Email or Username
                                </label>
                                <input
                                    type="text"
                                    value={loginForm.identifier}
                                    onChange={(e) =>
                                        setLoginForm((prev) => ({
                                            ...prev,
                                            identifier: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter email or username"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={loginForm.password}
                                    onChange={(e) =>
                                        setLoginForm((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter password"
                                />
                            </div>

                            {loginError ? (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {loginError}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-70"
                            >
                                {loginLoading ? "Please wait..." : "Login"}
                            </button>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProductReportClient;