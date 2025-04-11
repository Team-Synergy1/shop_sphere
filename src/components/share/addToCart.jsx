import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import useProduct from "@/hooks/useProduct";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AddToCart({ id, size , className = "" }) {
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const [products] = useProduct();
    const product = products?.find((p) => p._id == id);

    const handleAddToCart = async () => {
       
        if (status === "unauthenticated") {
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?callbackUrl=${returnUrl}`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post("/api/addCart", product);
            const wasUpdated = res.data.updated;
            const newQuantity = res.data.quantity;
            
            setTimeout(() => {
              setIsLoading(false);
              setIsAdded(true);
              
              const successMsg = wasUpdated 
                ? `Updated quantity to ${newQuantity}` 
                : "Added to cart!";

             
                setTimeout(() => {
                    setIsAdded(false);
                    toast.success(successMsg)
                   
                }, 2000);
            }, 600);
        } catch (error) {
            console.error("Error adding to cart:", error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleAddToCart}
            disabled={isLoading || isAdded}
            size={size}
            className={className}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Processing...
                </span>
            ) : isAdded ? (
                <span className="flex items-center gap-1">
                    <Check className="mr-2 h-5 w-5" />
                    Added to Cart
                </span>
            ) : (
                <span className="flex items-center gap-1">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </span>
            )}
        </Button>
    );
}