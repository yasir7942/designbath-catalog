import ProductGridClient from "./ProductGridClient";
import {
  getProudctListByBrand,
  getProudctListByFilter,
} from "../../../data/loader";
import { getImageUrl } from "../../../libs/helpers";

// ✅ META for WhatsApp preview
export async function generateMetadata({ params }) {
  const { type, slug } = await params;

  try {
    let products = [];

    if (type === "brand") {
      products = await getProudctListByBrand(slug);
    } else if (type === "filter") {
      products = await getProudctListByFilter(slug);
    }

    const firstProduct = products?.[0];

    const title =
      type === "brand"
        ? `${firstProduct?.brand?.name || slug} Products | Design Bath`
        : `${firstProduct?.tags?.[0]?.name || slug} Products | Design Bath`;

    const description = `Explore ${firstProduct?.brand?.name ||
      firstProduct?.tags?.[0]?.name ||
      slug
      } products in Design Bath digital catalog.`;

    const image = firstProduct?.image?.url
      ? getImageUrl(firstProduct.image.url)
      : "";

    return {
      title,
      description,

      openGraph: {
        title,
        description,
        url: `/product-grid/${type}/${slug}`,
        siteName: "Design Bath",
        images: image
          ? [
            {
              url: image,
              width: 1200,
              height: 1200,
              alt: title,
            },
          ]
          : [],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch (err) {
    console.error("Meta error:", err);

    return {
      title: "Design Bath Catalog",
      description: "Browse our product catalog",
    };
  }
}

// ✅ CLIENT UI CALL
export default function Page({ params }) {
  return <ProductGridClient params={params} />;
}