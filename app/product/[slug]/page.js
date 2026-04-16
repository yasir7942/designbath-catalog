import ProductClient from "./ProductClient";
import { getSingleProduct } from "../../data/loader";
import { getImageUrl } from "../../libs/helpers";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const productData = await getSingleProduct(slug);
    const product = productData?.data?.[0];

    if (!product) {
      return {
        title: "Product Not Found | Design Bath",
        description: "The requested product is not available.",
      };
    }

    const rawDescription = String(product?.details || "").trim();
    const description =
      rawDescription.length > 160
        ? `${rawDescription.slice(0, 157)}...`
        : rawDescription || "Explore premium bathroom products at Design Bath.";

    const imageUrl = product?.image?.url
      ? getImageUrl(product.image.url)
      : "";

    const productUrl = `/product/${slug}`;

    return {
      title: `${product.name} | Design Bath`,
      description,
      openGraph: {
        title: product.name,
        description,
        url: productUrl,
        siteName: "Design Bath",
        type: "website",
        images: imageUrl
          ? [
            {
              url: imageUrl,
              width: 1200,
              height: 1200,
              alt: product.name,
            },
          ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("generateMetadata error:", error);

    return {
      title: "Design Bath Product",
      description: "Explore premium bathroom products at Design Bath.",
    };
  }
}

const SingleProductPage = async ({ params }) => {
  return <ProductClient params={params} />;
};

export default SingleProductPage;