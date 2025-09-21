import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

interface PaymentComponentProps {
  amount: number;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

export default function PaymentComponent({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError, 
  disabled = false 
}: PaymentComponentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual Clover payment integration
      // For now, simulate payment processing
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock successful payment
      const mockPaymentId = `clover_${Date.now()}`;
      onPaymentSuccess?.(mockPaymentId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError?.(errorMessage);
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

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <Card data-testid="payment-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="payment-title">
          <Lock className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-primary" data-testid="payment-amount">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card Details Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="Full name on card"
              value={cardData.cardholderName}
              onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
              disabled={disabled || isProcessing}
              data-testid="input-cardholder-name"
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                maxLength={19}
                disabled={disabled || isProcessing}
                data-testid="input-card-number"
              />
              <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                maxLength={5}
                disabled={disabled || isProcessing}
                data-testid="input-expiry-date"
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                maxLength={4}
                type="password"
                disabled={disabled || isProcessing}
                data-testid="input-cvv"
              />
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secured with end-to-end encryption</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={disabled || isProcessing || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName}
          className="w-full"
          size="lg"
          data-testid="button-pay"
        >
          {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>

        {/* Clover Attribution */}
        <div className="text-center text-xs text-muted-foreground">
          <p data-testid="text-payment-provider">Powered by Clover Payment Processing</p>
        </div>
      </CardContent>
    </Card>
  );
}
