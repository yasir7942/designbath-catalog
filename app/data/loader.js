

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
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Content-Type": "application/json",
      "Strapi-Response-Format": "v4",
      Authorization: `Bearer ${authToken}`,
    },
    cache: cacheSystem,

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



/*********************** getProductMenuData ********************************** */
export async function getProductMenuData() {
  const [brandsRes, tagsRes, products] = await Promise.all([
    getAllBrandsList(),
    getAllFilterList(),
    getAllProductsForMenu(),
  ]);

  const brands = Array.isArray(brandsRes?.data) ? brandsRes.data : [];
  const tags = Array.isArray(tagsRes?.data) ? tagsRes.data : [];
  const allProducts = Array.isArray(products) ? products : [];

  const tagMap = new Map();
  tags.forEach((tag) => {
    if (tag?.id) {
      tagMap.set(tag.id, tag);
    }
  });

  const brandTagMap = new Map();

  allProducts.forEach((product) => {
    const brandId = product?.brand?.id;
    const productTags = Array.isArray(product?.tags) ? product.tags : [];

    if (!brandId) return;

    if (!brandTagMap.has(brandId)) {
      brandTagMap.set(brandId, new Map());
    }

    const currentBrandTags = brandTagMap.get(brandId);

    productTags.forEach((tag) => {
      if (tag?.id && !currentBrandTags.has(tag.id)) {
        currentBrandTags.set(tag.id, {
          id: tag.id,
          name: tag.name || "",
          slug: tag.slug || "",
        });
      }
    });
  });

  const menuData = brands.map((brand) => {
    const relatedTagsMap = brandTagMap.get(brand.id);
    const relatedTags = relatedTagsMap
      ? Array.from(relatedTagsMap.values()).sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      )
      : [];

    return {
      id: brand.id,
      name: brand.name || "",
      slug: brand.slug || "",
      logo: brand.logo || null,
      tags: relatedTags,
    };
  });

  return menuData.sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );
}

/*********************** getAllProductsForMenu ********************************** */
export async function getAllProductsForMenu() {
  let allProducts = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const productBlockQuery = qs.stringify({
      sort: ["name"],
      populate: ["brand", "tags"],
      pagination: {
        pageSize: 100,
        page,
      },
    });

    const response = await fetchData("products", productBlockQuery);

    const rows = Array.isArray(response?.data) ? response.data : [];
    allProducts = [...allProducts, ...rows];

    pageCount = response?.meta?.pagination?.pageCount || 1;
    page++;
  }

  return allProducts;
}



/********************* getAllProductsReport ***************************/
export async function getAllProductsReport() {
  let allProducts = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const productBlockQuery = qs.stringify({
      sort: ["brand.name", "name"],
      populate: ['image', 'videoLinks', 'brand', 'tags'],
      pagination: {
        pageSize: 100,
        page,
      },
    });

    const response = await fetchData("products", productBlockQuery);

    allProducts = [...allProducts, ...(response?.data || [])];
    pageCount = response?.meta?.pagination?.pageCount || 1;
    page++;
  }

  return allProducts;
}




/***********************getAllBrandsList********************************** */
export async function getAllBrandsList() {

  const blogBlockQuery = qs.stringify({
    filters: {
    },
    sort: ['index', 'name'],
    populate: ['logo', 'products'],
  });
  return await fetchData("brands", blogBlockQuery);
}



/***********************getAllFilterList********************************** */
export async function getAllFilterList() {

  const blogBlockQuery = qs.stringify({
    filters: {
    },
    sort: ['index', 'name'],
    populate: ['logo', 'products'],

  });
  return await fetchData("tags", blogBlockQuery);
}



/********************* getProudctListByBrand ***************************/
export async function getProudctListByBrand(brandSlug) {
  let allProducts = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const productBlockQuery = qs.stringify({
      filters: {
        brand: {
          slug: {
            $eq: brandSlug,
          },
        },
      },
      sort: ['price'],
      populate: ['image', 'videoLinks', 'brand', 'tags'],
      pagination: {
        pageSize: 100, // keep reasonable page size
        page: page,
      },
    });

    const response = await fetchData("products", productBlockQuery);

    // Assuming Strapi returns { data: [], meta: { pagination: { page, pageCount } } }
    allProducts = [...allProducts, ...response.data];

    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allProducts;
}



/********************* getProudctListByFilter ***************************/
export async function getProudctListByFilter(TagSlug) {
  let allProducts = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const productBlockQuery = qs.stringify({
      filters: {
        tags: {
          slug: {
            $eq: TagSlug,
          },
        },
      },
      sort: ['price'],
      populate: ['image', 'videoLinks', 'brand', 'tags'],
      pagination: {
        pageSize: 100, // better keep it reasonable (not 1000)
        page: page,
      },
    });

    const response = await fetchData("products", productBlockQuery);

    // Strapi normally returns { data: [...], meta: { pagination: { page, pageCount } } }
    allProducts = [...allProducts, ...response.data];

    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allProducts;
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


/*********************getProductBrandList*************************** */
export async function getProductBrandList() {

  const brandBlockQuery = qs.stringify({
    filters: {
    },
    populate: ['products', 'products.image'],

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




/********************* getAllBrandSlugs ***************************/
export async function getAllBrandSlugs() {
  let allBrands = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const blogBlockQuery = qs.stringify({
      fields: ["slug"], // Strapi v4 needs array for fields
      pagination: {
        pageSize: 100,
        page: page,
      },
    });

    const response = await fetchData("brands", blogBlockQuery);

    allBrands = [...allBrands, ...response.data];

    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allBrands;
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
    populate: ['image', 'videoLinks', 'brand', 'tags'],
  });
  return await fetchData("products", brandBlockQuery);
}



/********************* getAllProductSlugs ***************************/
export async function getAllProductSlugs() {
  let allProducts = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const BlockQuery = qs.stringify({
      fields: ["slug"], // use array for fields
      pagination: {
        pageSize: 100,
        page: page,
      },
    });

    const response = await fetchData("products", BlockQuery);

    allProducts = [...allProducts, ...response.data];

    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allProducts;
}