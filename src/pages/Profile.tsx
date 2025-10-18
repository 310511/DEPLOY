import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getBookingsByDateRange, extractBookings, getDefaultDateRange, formatDateForAPI, BookingItem, getBookingByReferenceId } from "@/services/bookingsApi";
import { getBookingDetails } from "@/services/bookingDetailsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CalendarIcon,
  Search,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  
  // Date filter state
  const defaultDates = getDefaultDateRange();
  const [fromDate, setFromDate] = useState<string>(defaultDates.fromDate.split('T')[0]); // YYYY-MM-DD
  const [toDate, setToDate] = useState<string>(defaultDates.toDate.split('T')[0]); // YYYY-MM-DD
  
  // Booking lookup by reference ID state
  const [bookingRefId, setBookingRefId] = useState<string>('');
  const [lookedUpBooking, setLookedUpBooking] = useState<BookingItem | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Fetch bookings by date range
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    setBookingsError(null);
    
    try {
      console.log('🔍 Fetching bookings from', fromDate, 'to', toDate);
      
      // Convert date strings to ISO format for API
      const fromDateTime = new Date(fromDate + 'T00:00:00.000Z');
      const toDateTime = new Date(toDate + 'T23:59:59.999Z');
      
      const response = await getBookingsByDateRange(
        formatDateForAPI(fromDateTime),
        formatDateForAPI(toDateTime)
      );
      
      const bookingsList = extractBookings(response);
      setBookings(bookingsList);
      console.log('✅ Fetched', bookingsList.length, 'bookings');
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setBookingsError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Look up booking by reference ID
  const handleLookupBooking = async () => {
    if (!bookingRefId.trim()) {
      setLookupError('Please enter a booking reference ID');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookedUpBooking(null);

    try {
      console.log('🔍 Looking up booking:', bookingRefId);
      const response = await getBookingByReferenceId(bookingRefId.trim());
      
      console.log('📦 Lookup response:', response);
      console.log('📦 Full response JSON:', JSON.stringify(response, null, 2));
      
      // Check if booking was found
      if (response.BookingDetail && typeof response.BookingDetail === 'object' && !Array.isArray(response.BookingDetail)) {
        const detail = response.BookingDetail as any;
        
        console.log('🔍 Raw BookingDetail:', detail);
        console.log('🔍 HotelDetails:', detail.HotelDetails);
        console.log('🔍 Rooms:', detail.Rooms);
        console.log('🔍 Rooms type:', typeof detail.Rooms);
        console.log('🔍 Rooms length:', detail.Rooms?.length);
        console.log('🔍 Is Rooms an array?', Array.isArray(detail.Rooms));
        
        if (detail.Rooms && typeof detail.Rooms === 'object') {
          const roomKeys = Object.keys(detail.Rooms);
          console.log('🔍 Rooms has', roomKeys.length, 'keys:', roomKeys);
          console.log('🔍 Rooms full object:', JSON.stringify(detail.Rooms, null, 2));
          
          // Log values of key fields
          console.log('🔍 Rooms.Currency:', detail.Rooms.Currency);
          console.log('🔍 Rooms.TotalFare:', detail.Rooms.TotalFare);
          console.log('🔍 Rooms.Name:', detail.Rooms.Name);
          console.log('🔍 Rooms.Inclusion:', detail.Rooms.Inclusion);
        }
        
        // Note: Rooms is an object, not an array
        // The data is accessed directly from detail.Rooms (not detail.Rooms[0])
        console.log('🔍 Checkin (lowercase):', detail.Checkin);
        console.log('🔍 CheckOut:', detail.CheckOut);
        
        // Transform BookingDetail API response to match BookingItem interface
        // NOTE: API uses "Checkin" (lowercase 'c') not "CheckIn"!
        // NOTE: Rooms is an OBJECT, not an array! Access it differently
        
        // Rooms is an object with fields directly, not an array!
        // Access fields directly from detail.Rooms
        const roomData = detail.Rooms;
        
        console.log('🔍 Using Rooms object directly:', roomData);
        
        // Extract customer names
        let guestNames = '';
        if (detail.CustomerDetails?.CustomerNames && Array.isArray(detail.CustomerDetails.CustomerNames)) {
          guestNames = detail.CustomerDetails.CustomerNames
            .map((c: any) => `${c.Title || ''} ${c.FirstName || ''} ${c.LastName || ''}`.trim())
            .filter((name: string) => name.length > 0)
            .join(', ');
        }
        
        // Extract cancellation policies
        let cancellationPolicyText = '';
        if (detail.Rooms?.CancelPolicies && Array.isArray(detail.Rooms.CancelPolicies)) {
          cancellationPolicyText = detail.Rooms.CancelPolicies
            .map((p: any) => `From ${p.FromDate}: ${p.ChargeType} - ${p.CancellationCharge}`)
            .join('; ');
        }
        
        const transformedBooking: BookingItem = {
          BookingStatus: detail.BookingStatus,
          ConfirmationNo: detail.ConfirmationNumber,
          CheckInDate: detail.Checkin || detail.CheckIn,
          CheckOutDate: detail.CheckOut,
          BookingDate: detail.BookingDate,
          TripName: detail.HotelDetails?.HotelName,
          HotelName: detail.HotelDetails?.HotelName,
          // Room details
          BookingPrice: roomData?.TotalFare,
          Currency: roomData?.Currency,
          TBOHotelCode: detail.HotelDetails?.Map,
          InvoiceNumber: detail.InvoiceNumber,
          VoucherStatus: detail.VoucherStatus,
          NoOfRooms: detail.NoOfRooms,
          RoomType: roomData?.Name,
          Inclusion: roomData?.Inclusion,
          // Hotel details
          HotelCity: detail.HotelDetails?.City,
          Rating: detail.HotelDetails?.Rating,
          // Additional room details
          MealType: roomData?.MealType,
          IsRefundable: roomData?.IsRefundable,
          TotalTax: roomData?.TotalTax,
          RoomPromotion: roomData?.RoomPromotion,
          // Customer details
          GuestName: guestNames,
          // Policies
          CancellationPolicy: cancellationPolicyText,
          RateConditions: roomData?.RateConditions,
        };
        
        console.log('✅ Transformed booking:', transformedBooking);
        console.log('✅ Fields check:');
        console.log('  - BookingPrice:', transformedBooking.BookingPrice);
        console.log('  - Currency:', transformedBooking.Currency);
        console.log('  - RoomType:', transformedBooking.RoomType);
        console.log('  - Inclusion:', transformedBooking.Inclusion);
        
        setLookedUpBooking(transformedBooking);
      } else if (response.Status?.Code === '200' && response.Status?.Description) {
        // Check if it's a "not found" message
        setLookupError(`No booking found with reference ID: ${bookingRefId}`);
      } else {
        setLookupError('Booking not found or invalid response');
      }
    } catch (error) {
      console.error('❌ Error looking up booking:', error);
      setLookupError('Failed to lookup booking. Please check the reference ID and try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Fetch bookings on component mount and when dates change
  useEffect(() => {
    fetchBookings();
  }, []); // Initial load

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full py-8 px-6 pt-header-plus-15 max-w-7xl mx-auto"
        style={{
          paddingTop: "calc(var(--header-height-default) + 31px + 14px)",
        }}
      >
        <h1 className="text-3xl font-bold mb-8">Your Bookings</h1>

        <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Bookings</CardTitle>
                  <Button 
                    onClick={fetchBookings} 
                    disabled={isLoadingBookings}
                    size="sm"
                    variant="outline"
                  >
                    {isLoadingBookings ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Date Filter */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Filter by Date Range
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor="fromDate" className="text-xs">From Date</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toDate" className="text-xs">To Date</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={fetchBookings}
                      disabled={isLoadingBookings}
                      className="w-full md:w-auto"
                    >
                      {isLoadingBookings ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CalendarIcon className="h-4 w-4 mr-2" />
                      )}
                      Search Bookings
                    </Button>
                  </div>
                </div>

                {/* Booking Lookup by Reference ID */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="text-sm font-semibold mb-3 flex items-center text-blue-900 dark:text-blue-100">
                    <Search className="h-4 w-4 mr-2" />
                    Verify Booking by Reference ID
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Enter a booking reference ID to check if it exists in the system. This is useful for verifying bookings.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor="bookingRefId" className="text-xs text-blue-900 dark:text-blue-100">
                        Booking Reference ID
                      </Label>
                      <Input
                        id="bookingRefId"
                        type="text"
                        placeholder="e.g., MOCK_1728893012345"
                        value={bookingRefId}
                        onChange={(e) => setBookingRefId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLookupBooking();
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={handleLookupBooking}
                      disabled={isLookingUp || !bookingRefId.trim()}
                      className="w-full md:w-auto"
                      variant="default"
                    >
                      {isLookingUp ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Looking up...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Lookup Booking
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Lookup Error */}
                  {lookupError && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded text-sm border border-red-200 dark:border-red-800">
                      {lookupError}
                    </div>
                  )}

                  {/* Looked Up Booking */}
                  {lookedUpBooking && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-500">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-base text-green-700 dark:text-green-400 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Booking Found!
                          </h4>
                          <p className="text-sm font-medium mt-1">
                            {lookedUpBooking.TripName || lookedUpBooking.HotelName || 'Hotel Booking'}
                          </p>
                          {lookedUpBooking.InvoiceNumber && (
                            <p className="text-xs text-muted-foreground">
                              Invoice: {lookedUpBooking.InvoiceNumber}
                            </p>
                          )}
                          {lookedUpBooking.BookingId && (
                            <p className="text-xs text-muted-foreground">
                              Booking ID: {lookedUpBooking.BookingId}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            lookedUpBooking.BookingStatus === "Vouchered" || lookedUpBooking.BookingStatus === "Confirmed"
                              ? "default"
                              : lookedUpBooking.BookingStatus === "Cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {lookedUpBooking.BookingStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        {lookedUpBooking.CheckInDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Check-in</p>
                            <p className="font-medium">{lookedUpBooking.CheckInDate}</p>
                          </div>
                        )}
                        {lookedUpBooking.CheckOutDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Check-out</p>
                            <p className="font-medium">{lookedUpBooking.CheckOutDate}</p>
                          </div>
                        )}
                        {lookedUpBooking.BookingPrice && (
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-medium">
                              {lookedUpBooking.Currency || 'USD'} {lookedUpBooking.BookingPrice}
                            </p>
                          </div>
                        )}
                        {lookedUpBooking.ConfirmationNo && (
                          <div>
                            <p className="text-xs text-muted-foreground">Confirmation</p>
                            <p className="font-medium font-mono">{lookedUpBooking.ConfirmationNo}</p>
                          </div>
                        )}
                        {lookedUpBooking.NoOfRooms && (
                          <div>
                            <p className="text-xs text-muted-foreground">Rooms</p>
                            <p className="font-medium">{lookedUpBooking.NoOfRooms}</p>
                          </div>
                        )}
                        {lookedUpBooking.RoomType && (
                          <div>
                            <p className="text-xs text-muted-foreground">Room Type</p>
                            <p className="font-medium">{lookedUpBooking.RoomType}</p>
                          </div>
                        )}
                        {lookedUpBooking.Inclusion && (
                          <div>
                            <p className="text-xs text-muted-foreground">Inclusion</p>
                            <p className="font-medium">{lookedUpBooking.Inclusion}</p>
                          </div>
                        )}
                        {lookedUpBooking.VoucherStatus !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Voucher</p>
                            <p className="font-medium">{lookedUpBooking.VoucherStatus ? '✅ Issued' : '❌ Not Issued'}</p>
                          </div>
                        )}
                        {lookedUpBooking.HotelCity && (
                          <div>
                            <p className="text-xs text-muted-foreground">City</p>
                            <p className="font-medium">{lookedUpBooking.HotelCity}</p>
                          </div>
                        )}
                        {lookedUpBooking.Rating && (
                          <div>
                            <p className="text-xs text-muted-foreground">Rating</p>
                            <p className="font-medium">{lookedUpBooking.Rating}</p>
                          </div>
                        )}
                        {lookedUpBooking.GuestName && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Guest(s)</p>
                            <p className="font-medium">{lookedUpBooking.GuestName}</p>
                          </div>
                        )}
                        {lookedUpBooking.MealType && (
                          <div>
                            <p className="text-xs text-muted-foreground">Meal Type</p>
                            <p className="font-medium">{lookedUpBooking.MealType}</p>
                          </div>
                        )}
                        {lookedUpBooking.IsRefundable !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Refundable</p>
                            <p className="font-medium">{lookedUpBooking.IsRefundable ? '✅ Yes' : '❌ No'}</p>
                          </div>
                        )}
                        {lookedUpBooking.TotalTax && (
                          <div>
                            <p className="text-xs text-muted-foreground">Total Tax</p>
                            <p className="font-medium">{lookedUpBooking.Currency || 'USD'} {lookedUpBooking.TotalTax}</p>
                          </div>
                        )}
                        {lookedUpBooking.RoomPromotion && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Promotion</p>
                            <p className="font-medium text-green-600">{lookedUpBooking.RoomPromotion}</p>
                          </div>
                        )}
                      </div>

                      {/* Cancellation Policy */}
                      {lookedUpBooking.CancellationPolicy && (
                        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200 dark:border-orange-800">
                          <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-1">Cancellation Policy</p>
                          <p className="text-xs text-orange-800 dark:text-orange-200">{lookedUpBooking.CancellationPolicy}</p>
                        </div>
                      )}

                      {/* Rate Conditions */}
                      {lookedUpBooking.RateConditions && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">Rate Conditions</p>
                          <p className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{lookedUpBooking.RateConditions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Error State */}
                {bookingsError && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
                    <p className="text-sm">{bookingsError}</p>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingBookings && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Loading bookings...</p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingBookings && !bookingsError && bookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        No bookings exist for the selected date range
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
                      <p className="text-sm text-yellow-800 font-medium mb-2">💡 Troubleshooting Tips:</p>
                      <ul className="text-xs text-yellow-700 text-left space-y-1">
                        <li>• Try a <strong>wider date range</strong> (e.g., last 6 months)</li>
                        <li>• If you just booked, <strong>wait 2-5 minutes</strong> for it to appear</li>
                        <li>• Check if booking was for <strong>different dates</strong></li>
                        <li>• Verify your <strong>confirmation number</strong> in localStorage</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Set wider date range (last 6 months to next 6 months)
                        const from = new Date();
                        from.setMonth(from.getMonth() - 6);
                        const to = new Date();
                        to.setMonth(to.getMonth() + 6);
                        setFromDate(from.toISOString().split('T')[0]);
                        setToDate(to.toISOString().split('T')[0]);
                        // Trigger search after state update
                        setTimeout(() => fetchBookings(), 100);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      🔍 Search last 6 months to next 6 months
                    </button>
                  </div>
                )}

                {/* Bookings List */}
                {!isLoadingBookings && !bookingsError && bookings.length > 0 && (
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <div
                        key={booking.BookingId || index}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-base">
                                {booking.TripName || booking.HotelName || 'Hotel Booking'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Booking ID: {booking.BookingId} {booking.TBOHotelCode && `• Hotel Code: ${booking.TBOHotelCode}`}
                              </p>
                              {booking.BookingDate && (
                                <p className="text-xs text-muted-foreground">
                                  Booked on: {booking.BookingDate}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={
                                booking.BookingStatus === "Vouchered" || booking.BookingStatus === "Confirmed" || booking.BookingStatus === "Completed"
                                  ? "default"
                                  : booking.BookingStatus === "Cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {booking.BookingStatus || 'Pending'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                            {booking.CheckInDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Check-in</p>
                                <p className="font-medium">{booking.CheckInDate}</p>
                              </div>
                            )}
                            {booking.CheckOutDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Check-out</p>
                                <p className="font-medium">{booking.CheckOutDate}</p>
                              </div>
                            )}
                            {booking.AgencyName && (
                              <div>
                                <p className="text-xs text-muted-foreground">Agency</p>
                                <p className="font-medium">{booking.AgencyName}</p>
                              </div>
                            )}
                            {booking.BookingPrice && (
                              <div>
                                <p className="text-xs text-muted-foreground">Total Amount</p>
                                <p className="font-medium">
                                  {booking.Currency || 'USD'} {booking.BookingPrice}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                            {booking.ConfirmationNo && (
                              <p className="text-muted-foreground">
                                Confirmation: <span className="font-mono font-medium text-foreground">{booking.ConfirmationNo}</span>
                              </p>
                            )}
                            {booking.ClientReferenceNumber && (
                              <p className="text-muted-foreground">
                                Reference: <span className="font-mono font-medium text-foreground">{booking.ClientReferenceNumber}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
