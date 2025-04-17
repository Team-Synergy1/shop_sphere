import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import useProduct from "@/hooks/useProduct";

export default function PurchaseButton({ productId }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [products] = useProduct();

  const handlePurchase = async () => {
    if (status !== "authenticated") {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?callbackUrl=${returnUrl}`);
      return;
    }

    try {
      setLoading(true);

     
      const product = products?.find((p) => p._id === productId);
      if (!product) {
        throw new Error("Product not found");
      }

  
      const cartResponse = await fetch("/api/addCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!cartResponse.ok) {
        const error = await cartResponse.json();
        throw new Error(error.message || "Failed to add item to cart");
      }

      // Check if user has addresses
      const addressResponse = await fetch("/api/user/address/check");
      const addressData = await addressResponse.json();

      // If user has a default address, skip to payment page
      if (addressData.success && addressData.addresses && addressData.addresses.some(addr => addr.isDefault)) {
        router.push("/checkout/payment");
      } else {
        // Otherwise go to address page
        router.push("/checkout/address");
      }
    } catch (error) {
      console.error("Error during purchase:", error);
      toast.error(
        error.message || "Failed to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={loading}
      variant="secondary"
      size="lg"
      className="w-full md:w-auto"
    >
      {loading ? "Processing..." : "Buy Now"}
    </Button>
  );
}