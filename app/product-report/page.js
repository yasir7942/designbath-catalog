import ProductReportClient from "./ProductReportClient";
import { generateMetadata as generatePageMetadata } from "../libs/metadata";

export async function generateMetadata() {
  const metadataParams = {
    pageTitle: "Product Report",
    pageSlug: "product-report",
    pageDescription:
      "Browse all products on one page with search, grouped by brand and category.",
    seoTitle: "Product Report",
    seoDescription:
      "Browse all products on one page with search, grouped by brand and category.",
    rebotStatus: true,
    canonicalLinks: "product-report",
    dataPublishedTime: "",
    category: "",
    image: "",
    imageAlternativeText: "",
    imageExt: "",
  };

  return await generatePageMetadata({
    type: "page",
    path: "",
    params: metadataParams,
  });
}

const ProductReport = () => {
  return <ProductReportClient />;
};

export default ProductReport;