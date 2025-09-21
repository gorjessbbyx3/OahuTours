
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  expiryMonth: z.string().min(2, "Required"),
  expiryYear: z.string().min(4, "Required"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  billingZip: z.string().min(5, "ZIP code is required"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentComponentProps {
  amount: number;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

export default function PaymentComponent({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  disabled = false 
}: PaymentComponentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Get Clover settings
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      billingZip: '',
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      // Create Clover payment
      const response = await apiRequest("POST", "/api/create-clover-payment", {
        amount: amount * 100, // Convert to cents
        currency: "usd",
        card: {
          number: data.cardNumber.replace(/\s/g, ''),
          exp_month: data.expiryMonth,
          exp_year: data.expiryYear,
          cvv: data.cvv,
        },
        billing: {
          name: data.cardholderName,
          zip: data.billingZip,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        onPaymentSuccess(result.paymentId);
      } else {
        onPaymentError(result.error || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      onPaymentError("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <Card className="shadow-xl" data-testid="card-payment">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Secured by Clover Payment Processing</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-payment-amount">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                      value={field.value}
                      disabled={disabled || isProcessing}
                      data-testid="input-card-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                      disabled={disabled || isProcessing}
                      data-testid="input-cardholder-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="expiryMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled || isProcessing}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expiry-month">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={disabled || isProcessing}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expiry-year">
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i} value={String(new Date().getFullYear() + i)}>
                            {new Date().getFullYear() + i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123"
                        maxLength={4}
                        type="password"
                        {...field}
                        disabled={disabled || isProcessing}
                        data-testid="input-cvv"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="billingZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing ZIP Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="12345" 
                      {...field} 
                      disabled={disabled || isProcessing}
                      data-testid="input-billing-zip"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={disabled || isProcessing || !settings?.cloverApiToken}
                data-testid="button-process-payment"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Process Payment ${amount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            {!settings?.cloverApiToken && (
              <div className="text-sm text-red-600 text-center">
                Clover payment integration not configured. Please contact administrator.
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center pt-2">
              Your payment information is encrypted and secure. Powered by Clover.
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
