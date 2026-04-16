"use client";

import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners"; // or any other spinner from react-spinners
import Image from "next/image";

import { getProductBrandList } from "../../data/loader";
import { getImageUrl } from "../../libs/helpers";

const ReadProductReport = () => {
    const [productBrand, setProductBrand] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productBrandData = await getProductBrandList();
                setProductBrand(productBrandData);
            } catch (e) {
                setError(e);
                console.error("An error occurred while fetching the data: ", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center mt-5 pb-16">
                <p className="font-normal text-xl text-[#BE1D21] text-center">
                    Compiling data, please wait a moment.......
                </p>
                <div className="pt-2">
                    <ClipLoader
                        color="#BE1D21"
                        loading={true}
                        size={80}
                        aria-label="Loading Spinner"
                    />
                </div>
            </div>
        );

    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="overflow-x-auto font-serif">
            {productBrand.data.map((brand) => (
                <div key={brand.id}>
                    <div className="pb-2 pl-1">{brand.name || "No Title"}</div>
                    <table className="table-auto w-full border-collapse border border-gray-200 text-gray-950">
                        <thead>
                            <tr>
                                <th className="border border-gray-200 text-sm">Id</th>
                                <th className="border border-gray-200 text-sm">Name</th>
                                <th className="border border-gray-200 text-sm">Model</th>
                                <th className="border border-gray-200 text-sm">Price</th>
                                <th className="border border-gray-200 text-sm">SalePrice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {brand.products?.data?.map((product) => (
                                <tr key={product.id}>
                                    <td className="border text-sm font-light border-gray-200 text-center">
                                        {product.id || <div className="text-center text-red-500">---</div>}
                                    </td>
                                    <td className="border text-sm font-light border-gray-200">
                                        {product.name ? (
                                            <a href="#" className="underline" target="_blank" rel="noreferrer">
                                                {product.name}
                                            </a>
                                        ) : (
                                            <div className="text-center text-red-500">---</div>
                                        )}
                                    </td>
                                    <td className="border text-sm font-light border-gray-200">
                                        {product.model}
                                    </td>
                                    <td className="border text-sm font-light border-gray-200">
                                        {product.price}
                                    </td>
                                    <td className="border text-sm font-light border-gray-200">
                                        {product.salePrice}
                                    </td>
                                    <td className="border text-sm font-light flex items-center justify-center">
                                        {product.image?.url ? (
                                            <Image
                                                className="w-6 hover:scale-[8] hover:cursor-pointer transition-transform duration-500"
                                                src={getImageUrl(product.image.url)}
                                                height={250}
                                                width={250}
                                                alt="product image"
                                                priority
                                            />
                                        ) : (
                                            <div className="text-center text-red-500">---</div>
                                        )}
                                    </td>
                                    <td className="border text-sm font-light border-gray-200">
                                        {product.productImage?.alternativeText || (
                                            <div className="text-center text-gray-400">title Auto Display</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <br />
                    <br />
                </div>
            ))}
        </div>
    );
};

export default ReadProductReport;
