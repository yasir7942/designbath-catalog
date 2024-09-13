
import CategoryBlock from "./components/layout/category-block";
import { getAllBrandsList, getAllFilterList } from "./data/loader";

 const  Home  = async () =>  {


 
  const brands = await getAllBrandsList(); 
  const filters = await getAllFilterList(); 

 /*
  console.log("-----------------------product brands Grid--------------------------------------------------");
  console.dir(brands, { depth: null });
  console.log("---------------------------End-----------------------end-----------------------");
 */
  return (

    <>

      <h1 className="capitalize text-center font-medium text-xl text-gray-600">Product Brands or Category</h1>
      <p className="capitalize text-center font-normal text-base text-gray-600">Price List</p>

      <div className="grid grid-cols-2 items-center pb-12 md:pb-26 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6  gap-3 space-y-4  md:gap-2 md:mx-10 xl:gap-x-2 xl:mx-38  mt-5  ">
             
             {brands.data.map((brand) => (
               <CategoryBlock key={brand.id} brand={brand} type="brand" />
             
            ))}  

      </div>

        <div className="text-center font-bold">Product Filters</div>

        <div className="grid grid-cols-2 items-center pb-12 md:pb-26 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6  gap-3 space-y-4  md:gap-2 md:mx-10 xl:gap-x-2 xl:mx-38  mt-5  ">
             
             {filters.data.map((filter) => (
               <CategoryBlock key={filter.id} brand={filter} type="filter" />
             
            ))}  

      </div>

    </>
  );
}

export default Home
