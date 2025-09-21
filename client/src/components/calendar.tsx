import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { Booking } from "@shared/schema";

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

  const isDateBooked = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate[dateKey]?.length > 0;
  };

  const getDateBookingCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return bookingsByDate[dateKey]?.length || 0;
  };

  return (
    <Card data-testid="calendar-container">
      <CardHeader>
        <CardTitle data-testid="calendar-title">
          {showBookings ? "Booking Calendar" : "Select Date"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md border"
          components={{
            Day: ({ date, ...props }) => {
              const bookingCount = getDateBookingCount(date);
              const isBooked = isDateBooked(date);

              return (
                <div className="relative" data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}>
                  <div {...props} className={`${props.className} ${isBooked ? 'bg-primary/10' : ''}`} />
                  {showBookings && bookingCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                      data-testid={`booking-count-${format(date, 'yyyy-MM-dd')}`}
                    >
                      {bookingCount}
                    </Badge>
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