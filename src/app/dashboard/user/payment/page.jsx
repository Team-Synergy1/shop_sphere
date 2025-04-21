"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/user/payment-methods");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setPaymentMethods(data.paymentMethods);
    } catch (error) {
      toast.error(error.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Failed to load Stripe");

      // Create a payment method using the Stripe Elements
      const { error: elementsError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
      });

      if (elementsError) {
        throw new Error(elementsError.message);
      }

      // Save the payment method to our backend
      const response = await fetch("/api/user/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Payment method added successfully");
      fetchPaymentMethods();
    } catch (error) {
      toast.error(error.message || "Failed to add payment method");
    }
  };

  const removePaymentMethod = async (paymentMethodId) => {
    try {
      const response = await fetch(`/api/user/payment-methods/${paymentMethodId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Payment method removed successfully");
      fetchPaymentMethods();
    } catch (error) {
      toast.error(error.message || "Failed to remove payment method");
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      const response = await fetch(`/api/user/payment-methods/${paymentMethodId}`, {
        method: "PATCH",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Default payment method updated");
      fetchPaymentMethods();
    } catch (error) {
      toast.error(error.message || "Failed to update default payment method");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <Button onClick={addPaymentMethod}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No payment methods found</p>
            <p className="text-sm text-muted-foreground">
              Add a payment method to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {paymentMethods.map((method) => (
            <Card key={method.stripePaymentMethodId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{method.cardBrand}</span>
                  {method.isDefault && (
                    <span className="text-sm font-normal text-primary">
                      Default Method
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  •••• •••• •••• {method.cardLast4}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Expires {method.cardExpiry}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultPaymentMethod(method.stripePaymentMethodId)}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePaymentMethod(method.stripePaymentMethodId)}
                >
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}