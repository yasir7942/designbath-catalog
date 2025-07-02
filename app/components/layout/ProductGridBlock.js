import Image from "next/image";
import { getImageUrl } from "../../libs/helpers";


const ProductGridBlock = ({ product, pageNumber }) => {
    let discountedPrice = 0;



    if (product.useBrandDiscount && product.brand.discount !== null && product.brand.discount !== "") {
        const discount = Number(product.brand.discount) / 100;
        discountedPrice = (Number(product.price) - (Number(product.price) * discount)) | 0;
    } else if (!product.useBrandDiscount && product.salePrice !== null && product.salePrice !== "") {
        if (IsFixValueDiscount) {
            discountedPrice = Number(product.price) - Number(product.salePrice);
        } else {
            let percentageDiscount = Number(product.salePrice) / 100;
            discountedPrice = (Number(product.price) - (Number(product.price) * percentageDiscount)) | 0;
        }
    }

    const isDiscounted = discountedPrice > 0;
    const productUrl = process.env.NEXT_PUBLIC_BASE_URL + "/product/" + product.slug;
    const ProductTitle = encodeURIComponent(product.name);
    const filterUrl = process.env.NEXT_PUBLIC_BASE_URL + "/product-list/filter/";

    return (
        <div className="flex flex-col justify-start items-center w-full h-auto border border-gray-300 shadow-md p-0 space-y-1">
            <div className="w-full h-auto ">
                {product.image?.url ? (

                    <Image


                        className="w-full h-auto pointer-events-none select-none"
                        priority
                        quality={100}
                        src={getImageUrl(product.image.url)}
                        width={1000}
                        height={1000}
                        alt={product.name}
                        draggable={false}
                    />

                ) : (
                    <div className="bg-gray-200 w-full h-60"></div>
                )}
            </div>

            <div className="flex flex-col w-full space-y-2 bg-slate-100 p-4">
                <div className="text-xs md:text-base">{product.name}</div>





                <div className="text-xs md:text-base">
                    <strong className={isDiscounted ? "line-through" : ""}>List Price:</strong>
                    <span className={isDiscounted ? "line-through   " : ""}>{product.price}/-</span>
                </div>

                {isDiscounted && <div className="text-xs md:text-base"><strong>Discounted Price:</strong> {discountedPrice > 0 ? `${discountedPrice}/-` : "N/A"}</div>}
            </div>






        </div>
    );
};

export default ProductGridBlock;
