import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BookingCalendar from "@/components/calendar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  CalendarCheck, 
  DollarSign, 
  MapPin, 
  Star, 
  Plus, 
  TrendingUp, 
  Users, 
  Download,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Calendar,
  Clock
} from "lucide-react";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from "recharts";

const adminBookingSchema = insertBookingSchema.extend({
  bookingDate: z.string(),
  numberOfGuests: z.number().min(1).max(20),
  totalAmount: z.number(),
});

type AdminBookingFormData = z.infer<typeof adminBookingSchema>;

// Sample chart data - in real app, calculate from bookings
const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
];

const tourDistribution = [
  { name: 'Circle Island Tour', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Pearl Harbor', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Sunset Cruise', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Custom Tours', value: 20, color: 'hsl(var(--chart-4))' },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
};

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [addBookingOpen, setAddBookingOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication with server validation
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/user");
        const user = await response.json();
        if (user?.isAdmin) {
          setIsAdminAuthenticated(true);
        } else {
          window.location.href = "/admin/login";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/admin/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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

  // Calculate real statistics
  const stats = useMemo(() => {
    const today = new Date();
    
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);

    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      return bookingDate.toDateString() === today.toDateString();
    }).length;

    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    const activeToursCount = tours.filter(t => t.isActive).length;

    return {
      totalRevenue,
      todayBookings,
      pendingBookings,
      activeToursCount
    };
  }, [bookings, tours]);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportBookings = () => {
    const csvContent = [
      ['Customer Name', 'Email', 'Tour', 'Date', 'Guests', 'Amount', 'Status'],
      ...filteredBookings.map(booking => [
        booking.customerName,
        booking.customerEmail,
        tours.find(t => t.id === booking.tourId)?.name || 'Unknown Tour',
        new Date(booking.bookingDate).toLocaleDateString(),
        booking.numberOfGuests.toString(),
        `$${booking.totalAmount}`,
        booking.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 bg-gradient-to-br from-background via-muted/30 to-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="pt-24 pb-20 bg-gradient-to-br from-background via-muted/30 to-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-light text-foreground mb-2" data-testid="text-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your tours today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={exportBookings}
              data-testid="button-export"
              className="glass-effect hover:scale-105 transition-transform"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Link href="/admin/settings">
              <Button variant="outline" data-testid="button-settings" className="glass-effect hover:scale-105 transition-transform">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-current rounded" />
                  Settings
                </div>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.removeItem("adminAuthenticated");
                localStorage.removeItem("adminUser");
                window.location.href = "/admin/login";
              }}
              data-testid="button-logout"
              className="glass-effect hover:scale-105 transition-transform"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Enhanced Dashboard Stats with Gradient Cards */}
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg glass-effect" data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">All paid bookings</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg glass-effect" data-testid="card-todays-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-todays-bookings">{stats.todayBookings}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg glass-effect" data-testid="card-pending-bookings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-bookings">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg glass-effect" data-testid="card-active-tours">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-tours">{stats.activeToursCount}</div>
              <p className="text-xs text-muted-foreground">Tour packages available</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-xl glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--chart-1))" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-xl glass-effect">
            <CardHeader>
              <CardTitle>Tour Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tourDistribution.length > 0 ? tourDistribution : [{ name: 'No Data', value: 100, color: 'hsl(var(--muted))' }]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => tourDistribution.length > 0 ? `${name}: ${value}%` : 'No bookings yet'}
                  >
                    {(tourDistribution.length > 0 ? tourDistribution : [{ name: 'No Data', value: 100, color: 'hsl(var(--muted))' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl glass-effect" data-testid="card-calendar">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Booking Calendar</CardTitle>
                  <Dialog open={addBookingOpen} onOpenChange={setAddBookingOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-booking" className="hover:scale-105 transition-transform">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-add-booking" className="glass-effect">
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

          {/* Enhanced Sidebar with Payment Tracking */}
          <div className="space-y-6">
            {/* Payment Tracking */}
            <Card className="shadow-xl glass-effect" data-testid="card-payment-tracking">
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const pendingPayments = bookings
                      .filter(b => b.paymentStatus === 'pending')
                      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);

                    const completedToday = bookings
                      .filter(b => {
                        const today = new Date();
                        const bookingDate = new Date(b.bookingDate);
                        return bookingDate.toDateString() === today.toDateString() && b.paymentStatus === 'paid';
                      })
                      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);

                    const refundsProcessed = bookings
                      .filter(b => b.paymentStatus === 'refunded')
                      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);

                    return (
                      <>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-yellow-800">Pending Payments</span>
                            <span className="text-yellow-600 font-bold" data-testid="text-pending-payments">
                              ${pendingPayments.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-green-800">Completed Today</span>
                            <span className="text-green-600 font-bold" data-testid="text-completed-today">
                              ${completedToday.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-red-800">Refunds Processed</span>
                            <span className="text-red-600 font-bold" data-testid="text-refunds-processed">
                              ${refundsProcessed.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 hover:scale-105 transition-transform" 
                  data-testid="button-clover-dashboard"
                  onClick={() => window.open('/api/clover/dashboard', '_blank')}
                >
                  View Clover Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Booking Management Table */}
        <Card className="mt-8 shadow-xl glass-effect" data-testid="card-booking-management">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Booking Management</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="text-center py-8">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-bookings">
                {searchTerm || filterStatus !== "all" ? "No bookings match your criteria" : "No bookings yet"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.slice(0, 10).map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="hover:bg-muted/50 transition-colors"
                      data-testid={`booking-row-${booking.id}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium" data-testid={`booking-customer-${booking.id}`}>
                            {booking.customerName}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tours.find(t => t.id === booking.tourId)?.name || 'Unknown Tour'}
                      </TableCell>
                      <TableCell data-testid={`booking-date-${booking.id}`}>
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{booking.numberOfGuests}</TableCell>
                      <TableCell>
                        <span className="font-semibold" data-testid={`booking-amount-${booking.id}`}>
                          ${booking.totalAmount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          data-testid={`booking-status-${booking.id}`}
                          className={
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          className={
                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}