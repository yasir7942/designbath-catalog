"use client";

import Image from "next/image";
import { useState } from "react";
import { ScaleLoader } from "react-spinners";
import { getImageUrl } from "../../libs/helpers";

const ProductGridBlock = ({ product, pageNumber }) => {
    let discountedPrice = 0;
    const [imgLoading, setImgLoading] = useState(true);

    if (
        product.useBrandDiscount &&
        product.brand?.discount !== null &&
        product.brand?.discount !== ""
    ) {
        const discount = Number(product.brand.discount) / 100;
        discountedPrice =
            (Number(product.price) - Number(product.price) * discount) | 0;
    } else if (
        !product.useBrandDiscount &&
        product.salePrice !== null &&
        product.salePrice !== ""
    ) {
        if (product.IsFixValueDiscount) {
            discountedPrice = Number(product.price) - Number(product.salePrice);
        } else {
            const percentageDiscount = Number(product.salePrice) / 100;
            discountedPrice =
                (Number(product.price) -
                    Number(product.price) * percentageDiscount) |
                0;
        }
    }

    const isDiscounted = discountedPrice > 0;

    return (
        <div className="flex flex-col justify-start items-center w-full border border-gray-300 shadow-md p-0 space-y-1">
            <div className="relative w-full bg-gray-50 overflow-hidden">
                <div className="relative w-full aspect-[5/5]  flex items-center justify-center">
                    {imgLoading && product.image?.url && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                            <ScaleLoader
                                color="#0047ff"
                                height={35}
                                width={4}
                                radius={2}
                                margin={2}
                            />
                        </div>
                    )}

                    {product.image?.url ? (
                        <Image
                            className={`w-full h-full object-contain pointer-events-none select-none transition-opacity duration-500 ${imgLoading ? "opacity-0" : "opacity-100"
                                }`}
                            src={getImageUrl(product.image.url)}
                            width={1000}
                            height={1400}
                            alt={product.name}
                            draggable={false}
                            onLoadingComplete={() => setImgLoading(false)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                            No Image
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col w-full space-y-2 bg-slate-100 p-4">
                <div className="text-xs md:text-base">{product.name}</div>

                <div className="text-xs md:text-base">
                    <strong className={isDiscounted ? "line-through" : ""}>Price:</strong>
                    <span className={isDiscounted ? "line-through" : ""}>
                        {" "}
                        {product.price}/-
                    </span>
                </div>

                {isDiscounted && (
                    <div className="text-xs md:text-base">
                        <strong>Discounted Price:</strong>{" "}
                        {discountedPrice > 0 ? `${discountedPrice}/-` : "N/A"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductGridBlock;