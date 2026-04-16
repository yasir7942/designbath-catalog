import ProductListClient from "./ProductListClient";
import {
  getProudctListByBrand,
  getProudctListByFilter,
} from "../../../data/loader";
import { getImageUrl } from "../../../libs/helpers";

// ✅ META
export async function generateMetadata({ params }) {
  const { type, slug } = await params;

  try {
    let products = [];

    if (type === "brand") {
      products = await getProudctListByBrand(slug);
    } else {
      products = await getProudctListByFilter(slug);
    }

    const firstProduct = products?.[0];

    const title =
      type === "brand"
        ? `${firstProduct?.brand?.name || slug} Products | Design Bath`
        : `${firstProduct?.tags?.[0]?.name || slug} Products | Design Bath`;

    const description = `Browse ${firstProduct?.brand?.name ||
      firstProduct?.tags?.[0]?.name ||
      slug
      } products in Design Bath catalog.`;

    const image = firstProduct?.image?.url
      ? getImageUrl(firstProduct.image.url)
      : "";

    return {
      title,
      description,

      openGraph: {
        title,
        description,
        url: `/product-list/${type}/${slug}`,
        images: image
          ? [
            {
              url: image,
              width: 1200,
              height: 1200,
            },
          ]
          : [],
      },
    };
  } catch {
    return {
      title: "Design Bath Catalog",
      description: "Browse products",
    };
  }
}

// ✅ CLIENT UI
export default function Page({ params }) {
  return <ProductListClient params={params} />;
}