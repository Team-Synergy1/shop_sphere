"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, Loader2, Tag, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const CouponApplier = ({ cartSubtotal, onApplyCoupon, onRemoveCoupon, appliedCoupon }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post("/api/coupons/validate", {
        code: couponCode,
        cartSubtotal
      });
      
      const couponData = response.data;
      
      // Pass the coupon data to the parent component
      onApplyCoupon(couponData);
      
      // Show success message
      toast.success("Coupon applied successfully");
      
      // Clear the input
      setCouponCode("");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to apply coupon";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    setCouponCode("");
    setError(null);
    toast.info("Coupon removed");
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium">Discount Code</h3>
      
      {appliedCoupon ? (
        <div>
          <div className="flex items-center justify-between bg-white p-3 border rounded-md">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="font-medium">{appliedCoupon.code}</span>
              <Badge variant="outline" className="bg-green-50">
                {appliedCoupon.discountDescription}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRemoveCoupon}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            <span>
              {appliedCoupon.discountAmount 
                ? `৳${appliedCoupon.discountAmount.toFixed(2)} discount applied` 
                : "Discount applied"}
            </span>
          </p>
        </div>
      ) : (
        <>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="uppercase"
              disabled={loading}
            />
            <Button 
              onClick={validateCoupon} 
              disabled={loading || !couponCode.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white min-w-20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default CouponApplier;