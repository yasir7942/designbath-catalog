
 
import qs from 'qs';
import { flattenAttributes } from '../libs/data-utils';
 

let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
let appMode = process.env.NEXT_PUBLIC_MODE;
let cacheSystem = "";
if (appMode == "dev") {
  cacheSystem = "no-cache";
}


export async function fetchData(path, filter) {

  const authToken = null;
  const headers =
  {
    method: "GET",
    header: {
      "Content-Type": "application-json",
      cache: cacheSystem,
      Authorization: `Bearer ${authToken}`,
    }

  }


  const url = new URL(path, baseUrl);
  url.search = filter;

  // show API links
  console.log(url.href);

  try {

    const response = await fetch(url.href, authToken ? headers : {});
    const data = await response.json();
     
     
    const flattenedData = flattenAttributes(data);
    

    // console.log(flattenedData)

    return flattenedData;
  } catch (error) {
    console.log(error);
  }
}


 /***********************getAllBrandsList********************************** */
export async function getAllBrandsList() {

  const blogBlockQuery = qs.stringify({
    filters: { 
    },
     sort: ['index', 'name'],
     populate: ['logo'],
  });
  return await fetchData("brands", blogBlockQuery);
}


 /***********************getAllFilterList********************************** */
 export async function getAllFilterList() {

  const blogBlockQuery = qs.stringify({
    filters: { 
    },
    sort: ['index', 'name'],
     populate: ['logo'],

  });
  return await fetchData("tags", blogBlockQuery);
}



  /*********************getProudctListByBrand*************************** */
export async function getProudctListByBrand(brandSlug) {
  const productBlockQuery = qs.stringify({
    filters: {
      brand: {
        slug: {
          $eq: brandSlug,
        },
      },
    },
    sort: ['price'],
    populate: ['image','videoLinks','brand','tags'],
    pagination: {
      pageSize: 1000,
      page: 1,
    },
  });
     return await fetchData("products", productBlockQuery);
  }



    /*********************getProudctListByFilter*************************** */
  export async function getProudctListByFilter(TagSlug) {
    const productBlockQuery = qs.stringify({
      filters: {
        tags: {
          slug: {
            $eq: TagSlug,
          },
        },
      },
      sort: ['price'],
      populate: ['image','videoLinks','brand','tags'],
      pagination: {
        pageSize: 1000,
        page: 1,
      },
    });
       return await fetchData("products", productBlockQuery);
    }



  /*********************getSpecificBrand*************************** */
  export async function getSpecificBrand(brandSlug) {
    const brandBlockQuery = qs.stringify({
    filters: {
          slug: {
            $eq: brandSlug,
          },
      },
      populate: ['logo'],
    });
      return await fetchData("brands", brandBlockQuery);
    }

  /*********************getSpecificFilter*************************** */

export async function getSpecificFilter(brandSlug) {
  const tagsBlockQuery = qs.stringify({
    filters: {
      slug: {
        $eq: brandSlug,
      },
    },
    populate: ['logo'],
  });
  return await fetchData("tags", tagsBlockQuery);
}




  /*********************getAllBrandSlugs*************************** */
export async function getAllBrandSlugs() {

  const blogBlockQuery = qs.stringify({

    fields: "slug",

  });
  return await fetchData("brands", blogBlockQuery);
}

  /*********************getAllFiltersSlugs*************************** */
  export async function getAllFiltersSlugs() {

    const blogBlockQuery = qs.stringify({
  
      fields: "slug",
  
    });
    return await fetchData("tags", blogBlockQuery);
  }



    /*********************getSingleProduct*************************** */
    export async function getSingleProduct(slug) {
      const brandBlockQuery = qs.stringify({
      filters: {
            slug: {
              $eq: slug,
            },
        },
        populate: ['image','videoLinks','brand','tags'],
      });
        return await fetchData("products", brandBlockQuery);
      }



/*********************getAllProductSlugs*************************** */
export async function getAllProductSlugs() {

  const  BlockQuery = qs.stringify({

    fields: "slug",

  });
  return await fetchData("products", BlockQuery);
}