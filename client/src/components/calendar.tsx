import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { Booking } from "@shared/schema";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";

interface BookingCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  showBookings?: boolean;
}

export default function BookingCalendar({ onDateSelect, selectedDate, showBookings = true }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: showBookings,
  });

  // Get bookings for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    return bookingDate >= monthStart && bookingDate <= monthEnd;
  });

  // Group bookings by date
  const bookingsByDate = monthBookings.reduce((acc, booking) => {
    const dateKey = format(new Date(booking.bookingDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const getBookingsForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate[dateKey] || [];
  };

  const isDateBooked = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate[dateKey]?.length > 0;
  };

  const getDateBookingCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate[dateKey]?.length || 0;
  };

  // For disabling days that have no bookings if showBookings is false
  const disabledDays = showBookings ? undefined : (date: Date) => !isDateBooked(date);
  const bookedDates = showBookings ? bookings.map(booking => new Date(booking.bookingDate)) : [];

  const checkAvailability = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/bookings/availability/${dateStr}`);
      if (!response.ok) throw new Error('Failed to check availability');

      const bookings = await response.json();
      // Simple availability logic - assume max 10 guests per day
      const totalGuests = bookings.reduce((sum: number, booking: any) => sum + booking.numberOfGuests, 0);
      return totalGuests < 10;
    } catch (error) {
      console.error('Error checking availability:', error);
      return true; // Default to available if check fails
    }
  };

  return (
    <Card data-testid="calendar-container">
      <CardHeader>
        <CardTitle data-testid="calendar-title">
          {showBookings ? "Booking Calendar" : "Select Date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={disabledDays}
          modifiers={{
            booked: bookedDates,
          }}
          modifiersStyles={{
            booked: { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' },
          }}
          components={{
            Day: ({ date, ...props }) => {
              const dayBookings = showBookings ? getBookingsForDate(date) : [];
              const hasBookings = dayBookings.length > 0;

              return (
                <div className="relative">
                  <button
                    {...props}
                    className={cn(
                      "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      date.toDateString() === selectedDate?.toDateString() && "bg-primary text-primary-foreground",
                      hasBookings && "bg-blue-100 text-blue-900",
                      props.disabled && "text-muted-foreground opacity-50"
                    )}
                  >
                    {date.getDate()}
                  </button>
                  {hasBookings && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              );
            },
          }}
          data-testid="calendar-component"
        />

        {showBookings && (
          <div className="mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/10 rounded"></div>
              <span>Days with bookings</span>
            </div>
          </div>
        )}

        {/* Show bookings for selected date */}
        {selectedDate && showBookings && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2" data-testid="selected-date-title">
              Bookings for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            {(() => {
              const dateKey = format(selectedDate, 'yyyy-MM-dd');
              const dayBookings = bookingsByDate[dateKey] || [];

              if (dayBookings.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground" data-testid="no-bookings-message">
                    No bookings for this date
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="text-sm p-2 bg-muted rounded-lg"
                      data-testid={`booking-${booking.id}`}
                    >
                      <div className="font-medium" data-testid={`booking-customer-${booking.id}`}>
                        {booking.customerName}
                      </div>
                      <div className="text-muted-foreground" data-testid={`booking-details-${booking.id}`}>
                        {booking.numberOfGuests} guests • ${booking.totalAmount}
                      </div>
                      <Badge
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        data-testid={`booking-status-${booking.id}`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}