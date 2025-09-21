import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingCalendar from "@/components/calendar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { CalendarCheck, DollarSign, MapPin, Star, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Booking, Tour } from "@shared/schema";

const adminBookingSchema = insertBookingSchema.extend({
  bookingDate: z.string(),
  numberOfGuests: z.number().min(1).max(20),
  totalAmount: z.number(),
});

type AdminBookingFormData = z.infer<typeof adminBookingSchema>;

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [addBookingOpen, setAddBookingOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user?.isAdmin, toast]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    retry: false,
  });

  const { data: tours = [] } = useQuery<Tour[]>({
    queryKey: ["/api/admin/tours"],
    retry: false,
  });

  const form = useForm<AdminBookingFormData>({
    resolver: zodResolver(adminBookingSchema),
    defaultValues: {
      tourId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      numberOfGuests: 1,
      specialRequests: '',
      status: 'confirmed',
      paymentStatus: 'paid',
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: AdminBookingFormData) => {
      const response = await apiRequest("POST", "/api/admin/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Booking Created",
        description: "Manual booking has been successfully created.",
      });
      form.reset();
      setAddBookingOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminBookingFormData) => {
    const selectedTour = tours.find(tour => tour.id === data.tourId);
    if (!selectedTour) {
      toast({
        title: "Error",
        description: "Please select a valid tour",
        variant: "destructive",
      });
      return;
    }

    const basePrice = parseFloat(selectedTour.price);
    const subtotal = basePrice * data.numberOfGuests;
    const tax = subtotal * 0.0825;
    const totalAmount = subtotal + tax;

    createBookingMutation.mutate({
      ...data,
      totalAmount,
    });
  };

  // Calculate dashboard stats
  const today = new Date();
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate.toDateString() === today.toDateString();
  });

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
  const weeklyRevenue = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= thisWeek && booking.paymentStatus === 'paid';
    })
    .reduce((total, booking) => total + parseFloat(booking.totalAmount), 0);

  const activeTours = tours.filter(tour => tour.isActive).length;

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 bg-muted min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="pt-24 pb-20 bg-muted min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light text-foreground" data-testid="text-dashboard-title">
            Admin Dashboard
          </h1>
          <Link href="/admin/settings">
            <Button variant="outline" data-testid="button-settings">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-current rounded" />
                Settings
              </div>
            </Button>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-stat-bookings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Today's Bookings</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-bookings">
                    {todayBookings.length}
                  </p>
                </div>
                <CalendarCheck className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Weekly Revenue</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-revenue">
                    ${weeklyRevenue.toFixed(0)}
                  </p>
                </div>
                <DollarSign className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-tours">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Tours</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-tours">
                    {activeTours}
                  </p>
                </div>
                <MapPin className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-stat-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Customer Rating</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-stat-rating">4.9</p>
                </div>
                <Star className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl" data-testid="card-calendar">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Booking Calendar</CardTitle>
                  <Dialog open={addBookingOpen} onOpenChange={setAddBookingOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-booking">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-add-booking">
                      <DialogHeader>
                        <DialogTitle>Add Manual Booking</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter customer name" {...field} data-testid="input-manual-customer-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="customerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="customer@example.com" {...field} data-testid="input-manual-customer-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="tourId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tour Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-manual-tour">
                                      <SelectValue placeholder="Select tour" />
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
                          
                          <FormField
                            control={form.control}
                            name="bookingDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date & Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    data-testid="input-manual-booking-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="numberOfGuests"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Number of Guests</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="20"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    value={field.value}
                                    data-testid="input-manual-guests"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-4 pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setAddBookingOpen(false)}
                              data-testid="button-cancel-manual"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={createBookingMutation.isPending}
                              data-testid="button-submit-manual"
                            >
                              {createBookingMutation.isPending ? "Adding..." : "Add Booking"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <BookingCalendar 
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                  showBookings={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Bookings */}
            <Card className="shadow-xl" data-testid="card-recent-bookings">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground" data-testid="text-no-bookings">
                    No bookings yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div 
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        data-testid={`booking-item-${booking.id}`}
                      >
                        <div>
                          <p className="font-medium" data-testid={`booking-customer-${booking.id}`}>
                            {booking.customerName}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`booking-date-${booking.id}`}>
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-semibold" data-testid={`booking-amount-${booking.id}`}>
                            ${booking.totalAmount}
                          </span>
                          <div>
                            <Badge 
                              variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                              data-testid={`booking-status-${booking.id}`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Tracking */}
            <Card className="shadow-xl" data-testid="card-payment-tracking">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const pendingPayments = bookings
                      .filter(b => b.paymentStatus === 'pending')
                      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);
                    
                    const completedToday = bookings
                      .filter(b => {
                        const bookingDate = new Date(b.bookingDate);
                        return bookingDate.toDateString() === today.toDateString() && b.paymentStatus === 'paid';
                      })
                      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);
                    
                    const refundsProcessed = bookings
                      .filter(b => b.paymentStatus === 'refunded')
                      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span>Pending Payments</span>
                          <span className="text-yellow-600 font-semibold" data-testid="text-pending-payments">
                            ${pendingPayments.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Completed Today</span>
                          <span className="text-green-600 font-semibold" data-testid="text-completed-today">
                            ${completedToday.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Refunds Processed</span>
                          <span className="text-red-600 font-semibold" data-testid="text-refunds-processed">
                            ${refundsProcessed.toFixed(0)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  data-testid="button-clover-dashboard"
                  onClick={() => window.open('/api/clover/dashboard', '_blank')}
                >
                  View Clover Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
