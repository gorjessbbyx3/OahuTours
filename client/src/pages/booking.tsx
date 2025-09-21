import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import BookingCalendar from "@/components/calendar";
import PaymentComponent from "@/components/payment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Tour } from "@shared/schema";

const bookingFormSchema = insertBookingSchema.extend({
  bookingDate: z.string(),
  numberOfGuests: z.number().min(1).max(20),
  totalAmount: z.number(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showPayment, setShowPayment] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get tour ID from URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTourId = urlParams.get('tour');

  const { data: tours = [] } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      tourId: preselectedTourId || '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      numberOfGuests: 1,
      specialRequests: '',
      status: 'pending',
      paymentStatus: 'pending',
    },
  });

  const selectedTour = tours.find(tour => tour.id === form.watch('tourId'));
  const numberOfGuests = form.watch('numberOfGuests');
  const basePrice = selectedTour?.price ? parseFloat(selectedTour.price) : 0;
  const subtotal = basePrice * numberOfGuests;
  const tax = subtotal * 0.0825; // 8.25% tax
  const totalAmount = subtotal + tax;

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Booking Created Successfully",
        description: `Your booking for ${selectedTour?.name} has been confirmed!`,
      });
      
      // Reset form and navigate to success page
      form.reset();
      setShowPayment(false);
      setSelectedDate(undefined);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      form.setValue('bookingDate', date.toISOString());
    }
  };

  const handleContinueToPayment = () => {
    form.setValue('totalAmount', totalAmount);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date before completing payment",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      ...form.getValues(),
      bookingDate: selectedDate.toISOString(),
      totalAmount,
      cloverPaymentId: paymentId,
      paymentStatus: 'paid' as const,
      status: 'confirmed' as const,
    };
    
    createBookingMutation.mutate(bookingData);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (showPayment) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-light text-foreground mb-6" data-testid="text-payment-title">
              Complete Your Booking
            </h1>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card data-testid="card-booking-summary">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tour:</span>
                    <span className="font-medium" data-testid="text-summary-tour">
                      {selectedTour?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium" data-testid="text-summary-date">
                      {selectedDate?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span className="font-medium" data-testid="text-summary-guests">
                      {numberOfGuests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium" data-testid="text-summary-customer">
                      {form.watch('customerName')}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span data-testid="text-summary-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span data-testid="text-summary-tax">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary" data-testid="text-summary-total">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowPayment(false)}
                  className="w-full"
                  data-testid="button-back-to-booking"
                >
                  Back to Booking Details
                </Button>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <PaymentComponent
              amount={totalAmount}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              disabled={createBookingMutation.isPending}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-foreground mb-6" data-testid="text-booking-title">
            Book Your Tour
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-booking-subtitle">
            Secure your spot on an unforgettable Oahu adventure
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <Card className="shadow-xl" data-testid="card-booking-form">
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  {/* Tour Selection */}
                  <FormField
                    control={form.control}
                    name="tourId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Tour</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tour">
                              <SelectValue placeholder="Choose a tour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tours.map((tour) => (
                              <SelectItem key={tour.id} value={tour.id}>
                                {tour.name} - ${tour.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number of Guests */}
                  <FormField
                    control={form.control}
                    name="numberOfGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-guests">
                              <SelectValue placeholder="Select number of guests" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} Guest{num > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Contact Information</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} data-testid="input-customer-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Your phone number" {...field} data-testid="input-customer-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Special Requests */}
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Dietary restrictions, accessibility needs, etc."
                            className="h-20"
                            {...field}
                            data-testid="textarea-special-requests"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Calendar & Summary */}
          <div className="space-y-6">
            {/* Date Selection */}
            <BookingCalendar 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              showBookings={false}
            />

            {/* Booking Summary */}
            {selectedTour && selectedDate && (
              <Card data-testid="card-booking-summary">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{selectedTour.name}</span>
                      <span data-testid="text-tour-price">${selectedTour.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of Guests</span>
                      <span data-testid="text-guest-count">{numberOfGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.25%)</span>
                      <span data-testid="text-tax">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-primary" data-testid="text-total">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleContinueToPayment}
                    className="w-full"
                    size="lg"
                    disabled={
                      !selectedDate || 
                      !selectedTour || 
                      !form.watch('customerName') || 
                      !form.watch('customerEmail') || 
                      !form.watch('customerPhone') ||
                      !form.watch('tourId') ||
                      !form.watch('numberOfGuests')
                    }
                    data-testid="button-continue-payment"
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
