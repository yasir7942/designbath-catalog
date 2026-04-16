"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { FiSearch } from "react-icons/fi";
import { getImageUrl } from "../libs/helpers";
import { getAllProductsReport } from "../data/loader";

const ProductReportClient = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [hoveredImage, setHoveredImage] = useState(null);

    useEffect(() => {
        let ignore = false;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getAllProductsReport();

                if (!ignore) {
                    setProducts(Array.isArray(result) ? result : []);
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
            const slug = String(product?.slug || "").toLowerCase();
            const stock = String(product?.stock ?? "").toLowerCase();
            const price = String(product?.price ?? "").toLowerCase();
            const salePrice = String(product?.salePrice ?? "").toLowerCase();
            const tagText = Array.isArray(product?.tags)
                ? product.tags.map((tag) => String(tag?.name || "")).join(" ").toLowerCase()
                : "";

            return (
                productName.includes(q) ||
                brandName.includes(q) ||
                slug.includes(q) ||
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
            const brandName = String(product?.brand?.name || "Other Brand").trim() || "Other Brand";

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <ClipLoader color="#0047ff" size={42} speedMultiplier={1} />
                <div className="mt-2 text-sm text-gray-600">Loading product report...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-4 text-center text-sm text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Hover image preview */}
            {hoveredImage ? (
                <div className="pointer-events-none fixed right-4 top-24 z-[9999] hidden w-[260px] rounded-lg border border-slate-300 bg-white p-2 shadow-2xl xl:block">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-gray-100">
                        <Image
                            src={hoveredImage.src}
                            alt={hoveredImage.alt}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-700">
                        {hoveredImage.alt}
                    </div>
                </div>
            ) : null}

            {/* Slim top header */}
            <div className="sticky top-0 z-40 mb-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold text-blue-900">Product Report</h1>
                        <div className="text-[11px] text-slate-500">
                            All products on one page • grouped by brand and category • {totalProducts} items
                        </div>
                    </div>

                    <div className="relative w-full lg:w-[360px]">
                        <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search product, brand, tag, slug, stock..."
                            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>
            </div>

            {/* Slim sticky index */}
            <div className="sticky top-[68px] z-30 mb-4 rounded-xl border border-slate-200 bg-slate-50/95 px-2 py-2 backdrop-blur">
                <div className="max-h-[160px] overflow-y-auto">
                    <div className="flex flex-wrap gap-1.5">
                        {brandTagIndex.map((brand) => (
                            <div key={brand.brandName} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                                <a
                                    href={`#brand-${encodeURIComponent(brand.brandName)}`}
                                    className="block text-[11px] font-semibold text-blue-900 hover:underline"
                                >
                                    {brand.brandName}
                                </a>

                                <div className="mt-1 flex max-w-[260px] flex-wrap gap-1">
                                    {brand.tagNames.map((tagName) => (
                                        <a
                                            key={`${brand.brandName}-${tagName}`}
                                            href={`#tag-${encodeURIComponent(brand.brandName)}-${encodeURIComponent(tagName)}`}
                                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-blue-50 hover:text-blue-800"
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
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No matching products found.
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedData.map((brandGroup) => (
                        <section
                            key={brandGroup.brandName}
                            id={`brand-${encodeURIComponent(brandGroup.brandName)}`}
                            className="scroll-mt-[130px]"
                        >
                            <div className="mb-2 border-b-2 border-blue-800 pb-1">
                                <h2 className="text-lg font-semibold text-blue-900">
                                    {brandGroup.brandName}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {brandGroup.tags.map((tagGroup) => (
                                    <div
                                        key={`${brandGroup.brandName}-${tagGroup.tagName}`}
                                        id={`tag-${encodeURIComponent(brandGroup.brandName)}-${encodeURIComponent(tagGroup.tagName)}`}
                                        className="scroll-mt-[140px]"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-blue-800">
                                                {tagGroup.tagName}
                                            </h3>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                                                {tagGroup.items.length}
                                            </span>
                                        </div>

                                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                            {/* desktop header */}
                                            <div className="hidden grid-cols-[54px_minmax(220px,1.8fr)_0.8fr_1.2fr_72px_72px_120px_62px] gap-2 border-b border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600 lg:grid">
                                                <div>Image</div>
                                                <div>Product</div>
                                                <div>Brand</div>
                                                <div>Tags</div>
                                                <div>Price</div>
                                                <div>Sale</div>
                                                <div>Slug</div>
                                                <div>Stock</div>
                                            </div>

                                            <div className="divide-y divide-slate-200">
                                                {tagGroup.items.map((product) => {
                                                    const tagText =
                                                        Array.isArray(product?.tags) && product.tags.length > 0
                                                            ? product.tags
                                                                .map((tag) => String(tag?.name || "").trim())
                                                                .filter(Boolean)
                                                                .join(", ")
                                                            : "—";

                                                    const priceText =
                                                        product?.price !== null &&
                                                            product?.price !== undefined &&
                                                            product?.price !== ""
                                                            ? product.price
                                                            : "—";

                                                    const salePriceText =
                                                        product?.salePrice !== null &&
                                                            product?.salePrice !== undefined &&
                                                            product?.salePrice !== ""
                                                            ? product.salePrice
                                                            : "—";

                                                    const stockText =
                                                        product?.stock !== null &&
                                                            product?.stock !== undefined &&
                                                            product?.stock !== ""
                                                            ? product.stock
                                                            : "—";

                                                    const imageSrc = product?.image?.url
                                                        ? getImageUrl(product.image.url)
                                                        : null;

                                                    return (
                                                        <div
                                                            key={product.id}
                                                            className="px-2 py-2 text-[11px] transition hover:bg-slate-50"
                                                        >
                                                            {/* desktop slim row */}
                                                            <div className="hidden items-center gap-2 lg:grid lg:grid-cols-[54px_minmax(220px,1.8fr)_0.8fr_1.2fr_72px_72px_120px_62px]">
                                                                <div className="flex h-[54px] w-[44px] items-center justify-center overflow-hidden rounded bg-gray-100">
                                                                    {imageSrc ? (
                                                                        <Image
                                                                            src={imageSrc}
                                                                            alt={product?.name || "Product"}
                                                                            width={88}
                                                                            height={108}
                                                                            className="h-full w-full cursor-zoom-in object-contain"
                                                                            onMouseEnter={() =>
                                                                                setHoveredImage({
                                                                                    src: imageSrc,
                                                                                    alt: product?.name || "Product",
                                                                                })
                                                                            }
                                                                            onMouseLeave={() => setHoveredImage(null)}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[9px] text-slate-400">
                                                                            No
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div className="truncate font-medium text-slate-900">
                                                                        {product?.name || "Untitled Product"}
                                                                    </div>
                                                                </div>

                                                                <div className="truncate text-slate-700">
                                                                    {product?.brand?.name || "—"}
                                                                </div>

                                                                <div className="line-clamp-2 text-slate-700">
                                                                    {tagText}
                                                                </div>

                                                                <div className="font-medium text-slate-800">
                                                                    {priceText}
                                                                </div>

                                                                <div className="font-medium text-green-700">
                                                                    {salePriceText}
                                                                </div>

                                                                <div className="break-all text-slate-700">
                                                                    {product?.slug || "—"}
                                                                </div>

                                                                <div className="text-slate-700">
                                                                    {stockText}
                                                                </div>
                                                            </div>

                                                            {/* mobile compact card */}
                                                            <div className="lg:hidden">
                                                                <div className="flex gap-2">
                                                                    <div className="flex h-[68px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                                                                        {imageSrc ? (
                                                                            <Image
                                                                                src={imageSrc}
                                                                                alt={product?.name || "Product"}
                                                                                width={88}
                                                                                height={108}
                                                                                className="h-full w-full object-contain"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-[9px] text-slate-400">
                                                                                No Image
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-[12px] font-semibold text-slate-900">
                                                                            {product?.name || "Untitled Product"}
                                                                        </div>

                                                                        <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                                                                            <div>
                                                                                <span className="font-medium text-slate-500">Brand:</span>{" "}
                                                                                <span className="text-slate-800">{product?.brand?.name || "—"}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-slate-500">Stock:</span>{" "}
                                                                                <span className="text-slate-800">{stockText}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-slate-500">Price:</span>{" "}
                                                                                <span className="text-slate-800">{priceText}</span>
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium text-slate-500">Sale:</span>{" "}
                                                                                <span className="text-green-700">{salePriceText}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-1 line-clamp-2 text-[10px] text-slate-700">
                                                                            <span className="font-medium text-slate-500">Tags:</span> {tagText}
                                                                        </div>

                                                                        <div className="mt-1 break-all text-[10px] text-slate-700">
                                                                            <span className="font-medium text-slate-500">Slug:</span>{" "}
                                                                            {product?.slug || "—"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReportClient;