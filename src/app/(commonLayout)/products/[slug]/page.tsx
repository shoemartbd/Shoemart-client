import ProductDetails from "@/components/modules/Product/ProductDetails";
import { getProductBySlug } from "@/services/product.services";
import { stripHtml } from "@/lib/utils";
import { Metadata } from "next";
import { cache } from "react";

// generateMetadata and the page both need the product; one request serves both
const loadProduct = cache((slug: string) => getProductBySlug(slug));

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await loadProduct(slug);
    const product = response?.data;

    if (!product) {
      return { title: "Product Not Found" };
    }

    return {
      title: `${product.name} | Shoe Mart`,
      description: stripHtml(product.shortDescription),
    };
  } catch (error) {
    return { title: "Product | Shoe Mart" };
  }
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  let product = null;
  let hasError = false;

  try {
    const response = await loadProduct(slug);
    product = response?.data;
  } catch (error) {
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            Failed to load product details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Product Not Found
          </h1>
          <p className="text-muted-foreground">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return <ProductDetails product={product} />;
}
