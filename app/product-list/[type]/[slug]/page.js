import { getProudctListByBrand , getSpecificBrand, getSpecificFilter, 
  getProudctListByFilter, getAllBrandSlugs, getAllFiltersSlugs} from "../../../data/loader";
import ProductBlock from "../../../components/layout/product-block";
import { generateMetadata as generatePageMetadata } from "../../../libs/metadata";
import { getImageUrl } from "../../../libs/helpers";





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

   console.log(combinedSlugs);

    return combinedSlugs || [];
  } catch (error) {
    console.log("generateStaticParams Error:" + error);
    throw new Error("Error Fetching generateStaticParams");
  }
}



 
export async function generateMetadata({ params }) {
  const { type, slug } = params;
  let  pCategory;

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
     image: getImageUrl(pCategory.data[0]?.logo.url) ,
   };

  //  console.dir(pCategory, { depth:null}); 
  // console.dir(metadataParams ); 
 
   return await generatePageMetadata({  params: metadataParams });
 }
 



const ProductList = async ({params}) => {
  const { type, slug } = params;

  let products;

  if (type === 'brand') {
    products = await getProudctListByBrand(slug);
   

  } else if (type === 'filter') {
    products = await getProudctListByFilter(slug);
  } else {
    throw new Error("Invalid type. Must be 'brand' or 'Tags/Filters'.");
  }


  //products.sort((a, b) => a.price - b.price);

 
   
 
     
   //console.log("-----------------------product brands/filter--------------------------------------------------");
   //   console.dir(products, { depth: null });
  // console.log("---------------------------End-----------------------end-----------------------");

  return (
    <div>

        {products.data.map((product, index) => (
      
             <ProductBlock key={product.id} product={product} pageNumber={index+1} />  
       ))}  

    </div>
  )
}

export default ProductList
