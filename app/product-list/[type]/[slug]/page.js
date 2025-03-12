import {
  getProudctListByBrand, getSpecificBrand, getSpecificFilter,
  getProudctListByFilter, getAllBrandSlugs, getAllFiltersSlugs
} from "../../../data/loader";
import ProductBlock from "../../../components/layout/product-block";
import { generateMetadata as generatePageMetadata } from "../../../libs/metadata";



export const generateStaticParams = async () => {
  try {

    const brandSlug = await getAllBrandSlugs();
    const filterSlug = await getAllFiltersSlugs();

    const brandSlugs = brandSlug?.data?.map((brand) => {
      return {
        type: 'brand',
        slug: brand.slug
      };
    });

    const filterSlugs = filterSlug?.data?.map((filter) => {
      return {
        type: 'filter',
        slug: filter.slug
      };
    });

    // Combine both arrays of slugs
    const combinedSlugs = [...brandSlugs, ...filterSlugs];

    //console.log(combinedSlugs);

    return combinedSlugs || [];
  } catch (error) {
    console.log("generateStaticParams Error:" + error);
    throw new Error("Error Fetching generateStaticParams");
  }
}




export async function generateMetadata({ params }) {
  const { type, slug } = params;
  let pCategory;

  if (type === 'brand') {
    pCategory = await getSpecificBrand(slug);
  } else if (type === 'filter') {
    pCategory = await getSpecificFilter(slug);
  } else {
    throw new Error("Invalid type. Must be 'brand' or 'Tags/Filters'.");
  }
  const metadataParams = {
    pageTitle: pCategory.data[0]?.name,
    pageDescription: pCategory.data[0]?.details,
    image: pCategory.data[0]?.logo.url,
  };

  //  console.dir(pCategory, { depth:null}); 
  // console.dir(metadataParams ); 

  return await generatePageMetadata({ params: metadataParams });
}




const ProductList = async ({ params }) => {
  const { type, slug } = params;

  let products;
  let listType = ""

  if (type === 'brand') {
    products = await getProudctListByBrand(slug);
    listType = "Brand: " + products.data[0]?.brand?.name;


  } else if (type === 'filter') {
    products = await getProudctListByFilter(slug);
    listType = "Filter: " + products.data[0]?.tags?.data[0]?.name;
  } else {
    throw new Error("Invalid type. Must be 'brand' or 'Tags/Filters'.");
  }


  //products.sort((a, b) => a.price - b.price);


  console.log(slug);


  console.log("-----------------------product brands/filter--------------------------------------------------");
  console.dir(products, { depth: null });
  console.log("---------------------------End-----------------------end-----------------------");

  return (
    <div>


      <div className=" text-lg text-center font-bold py-2">{listType} </div>

      {products.data.map((product, index) => (

        <ProductBlock key={product.id} product={product} pageNumber={index + 1} />
      ))}

    </div>
  )
}

export default ProductList
