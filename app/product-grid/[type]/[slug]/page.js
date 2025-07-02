import {
  getProudctListByBrand, getSpecificBrand, getSpecificFilter,
  getProudctListByFilter, getAllBrandSlugs, getAllFiltersSlugs
} from "../../../data/loader";
import ProductGridBlock from "../../../components/layout/ProductGridBlock";
import { generateMetadata as generatePageMetadata } from "../../../libs/metadata";
import Link from "next/link";



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




export async function generateMetadata(props) {
  const params = await props.params;
  const { type, slug } = params;
  let pCategory;

  if (type === 'brand') {
    pCategory = await getSpecificBrand(slug);
  } else if (type === 'filter') {
    pCategory = await getSpecificFilter(slug);
  } else {
    throw new Error("Invalid type. Must be 'brand' or 'Tags/Filters'.");
  }

  //console.log("------------start------------")
  //console.dir(pCategory, { depth: null });

  //console.log("------------end------------")


  const metadataParams = {
    pageTitle: pCategory.data[0]?.name,
    pageDescription: pCategory.data[0]?.details,
    image: pCategory.data[0]?.logo?.url || "",
  };

  ;

  return await generatePageMetadata({ params: metadataParams });
}




const ProductGrid = async props => {
  const params = await props.params;
  const { type, slug } = params;

  let products;
  let listType = ""
  let url = process.env.NEXT_PUBLIC_BASE_URL + '/product/';

  if (type === 'brand') {
    products = await getProudctListByBrand(slug);
    listType = "Brand: " + products.data[0]?.brand?.name;


  } else if (type === 'filter') {
    products = await getProudctListByFilter(slug);
    listType = "Filter: " + products.data[0]?.tags[0]?.name;
  } else {
    throw new Error("Invalid type. Must be 'brand' or 'Tags/Filters'.");
  }


  //products.sort((a, b) => a.price - b.price);


  //console.log(products);
  //console.log(listType);

  console.log("-----------------------product brands/filter--------------------------------------------------");
  //console.dir(products, { depth: null });
  console.log("---------------------------End-----------------------end-----------------------");

  return (
    <div>


      <div className=" text-lg text-center font-bold py-2">{listType} </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 px-0 mb-3">
        {products.data.map((product, index) => (
          <Link href={url + product.slug} key={product.id}>
            <ProductGridBlock product={product} pageNumber={index + 1} />
          </Link>

        ))}
      </div>

    </div >
  )
}

export default ProductGrid
