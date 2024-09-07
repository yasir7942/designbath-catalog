import { cache } from 'react';
import {getSingleProduct, getAllProductSlugs } from "../../data/loader"
import ProductBlock from "../../components/layout/product-block";
import { generateMetadata as generatePageMetadata } from "../../libs/metadata";
import { getImageUrl } from '../../libs/helpers';


// Cache the geSingleProduct function
const cachedGeSingleProduct = cache(getSingleProduct); 


export const generateStaticParams = async () => {
    try {
  
      const slugData = await getAllProductSlugs();
      const productSlug = slugData?.data?.map((pSlug) => {
        return {
          slug: pSlug.slug
        };
      });
  
      return productSlug || [];
    } catch (error) {
      console.log("generateStaticParams Error:" + error);
      throw new Error("Error Fetching generateStaticParams");
    }
  }

  
  export async function generateMetadata({ params }) {
    
    
    const productData = await cachedGeSingleProduct(params.slug);
  
    
     const metadataParams = {
       pageTitle: productData.data[0]?.name,
       pageDescription: productData.data[0]?.details,
       image:  getImageUrl(productData.data[0].image.url),
     };
  
    //  console.dir(pCategory, { depth:null}); 
    // console.dir(metadataParams ); 
   
     return await generatePageMetadata({  params: metadataParams });
   }



const SingleProduct = async ({params}) => {


    const productData = await cachedGeSingleProduct(params.slug);


    let discountedPrice = 0;
    
    const product = productData.data[0];
    if(product.useBrandDiscount && product.brand.discount !== null && product.brand.discount !== '')
        {
            const discount = Number(product.brand.discount) / 100;
             discountedPrice = (Number(product.price) - (Number(product.price) * discount)) | 0;
           
        }
        else if(!product.useBrandDiscount &&   product.salePrice !== null && product.salePrice !== '')
        {
             if(IsFixValueDiscount)
             {
               discountedPrice = Number(product.price) - Number(product.salePrice)
             }
             else
             {
               let percentageDiscount = Number(product.salePrice) / 100;
               discountedPrice = (Number(product.price) - (Number(product.price) * percentageDiscount)) | 0;
   
               }
   
        }


 
      // console.log("-----------------single product data --------------");
     //   console.dir(product, { depth:null});
    // console.log("-----------------End------------"); 



     const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": getImageUrl(product.image.url),
        "image": [
          getImageUrl(product.image.url),  // large
          getImageUrl(product.image.formats.thumbnail.url),  // medium
        ],
        "description": product.details,
        "brand": {
          "@type": "Brand",
          "name": product.brand.name
        },
       
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PKR",
          "price": product.price,
          "lowPrice": discountedPrice,
          "highPrice": product.price,
          "priceValidUntil": "10-10-2030",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "http://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Design Bath Walton Road"
          }
        },
       
        
      };




  return (
    <div>


      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
           <ProductBlock   product={product} pageNumber={0} />  
      
    </div>
  )
}

export default SingleProduct
