"use client";

import { useEffect, useState } from "react";
import CategoryBlock from "./components/layout/category-block";
import { getAllBrandsList, getAllFilterList } from "./data/loader";
import { ClipLoader } from "react-spinners";

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        setLoading(true);

        const brandsRes = await getAllBrandsList();
        const filtersRes = await getAllFilterList();

        const brandData = Array.isArray(brandsRes?.data)
          ? brandsRes.data.filter((b) => b?.products?.length > 0)
          : [];

        const filterData = Array.isArray(filtersRes?.data)
          ? filtersRes.data.filter((f) => f?.products?.length > 0)
          : [];

        if (!ignore) {
          setBrands(brandData);
          setFilters(filterData);
        }
      } catch (err) {
        console.error("Home Load Error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ClipLoader color="#0047ff" size={50} />
        <p className="mt-3 text-gray-600 text-sm">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">

      {/* Slim Hero */}
      <section className="px-3 pt-4 pb-4 sm:px-4 sm:pt-5 sm:pb-5 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-5 text-center sm:px-6 sm:py-6 md:px-8 md:py-7">

              <div className="mx-auto mb-2 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                Design Bath Digital Catalog
              </div>

              <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-blue-900">
                Explore Product Brands & Categories
              </h1>

              <p className="mx-auto mt-2 max-w-3xl text-xs sm:text-sm text-slate-600">
                Browse our digital catalog by brand or category.
              </p>

              <div className="mt-4 flex justify-center gap-3">
                <div className="rounded-lg border bg-slate-50 px-3 py-2">
                  <div className="text-lg font-semibold text-blue-900">
                    {brands.length}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Active Brands
                  </div>
                </div>

                <div className="rounded-lg border bg-slate-50 px-3 py-2">
                  <div className="text-lg font-semibold text-blue-900">
                    {filters.length}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Active Categories
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-3 pb-6 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-7xl">

          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold text-blue-900">
              Product Categories
            </h2>
            <span className="text-sm font-semibold bg-slate-100 text-blue-800  px-3 pt-2 py-3 rounded">
              {filters.length}
            </span>
          </div>

          <div className="rounded-2xl border bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filters.map((filter) => (
                <CategoryBlock
                  key={filter.id}
                  brand={filter}
                  type="filter"
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Brands */}
      <section className="px-3 pb-10 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-7xl">

          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold text-blue-900">
              Product Brands
            </h2>
            <span className="text-sm font-semibold bg-slate-100 text-blue-800  px-3 pt-2 py-3 rounded">
              {brands.length}
            </span>
          </div>

          <div className="rounded-2xl border bg-white p-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {brands.map((brand) => (
                <CategoryBlock
                  key={brand.id}
                  brand={brand}
                  type="brand"
                />
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;