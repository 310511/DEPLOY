import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Clock, User, Calendar, Users } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import CancelModal from "@/components/CancelModal";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [prebookData, setPrebookData] = useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (location.state?.prebookData) {
      setPrebookData(location.state.prebookData);
    }
    if (location.state?.hotelDetails) {
      setHotelDetails(location.state.hotelDetails);
    }
  }, [location.state]);

  if (!prebookData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground">No prebooking data found</p>
              <Button onClick={() => navigate(-1)} className="mt-4">
                Go Back
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hotel Details
        </Button>

        {/* Warning Message */}
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            ⚠️ <strong>Important:</strong> The booking would be cancelled after 24 hours if payment is not completed.
          </AlertDescription>
        </Alert>

        {/* Top Row - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
          {/* Left Column - Cancellation Policies & Amenities */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Cancellation Policies Card */}
            {prebookData.HotelResult?.Rooms?.CancelPolicies && prebookData.HotelResult.Rooms.CancelPolicies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cancellation Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {prebookData.HotelResult.Rooms.CancelPolicies.map((policy: any, index: number) => {
                      console.log('Cancel Policy:', policy);
                      return (
                        <li key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-primary font-bold">•</span>
                          <div className="flex-1">
                            {policy.FromDate && (
                              <div className="font-semibold text-gray-900">
                                From: {new Date(policy.FromDate).toLocaleDateString()}
                              </div>
                            )}
                            {policy.Charge && (
                              <div className="text-gray-700">Charge: {policy.Charge}%</div>
                            )}
                            {policy.ChargeType && (
                              <div className="text-gray-600">Type: {policy.ChargeType}</div>
                            )}
                            {policy.Currency && policy.CancellationCharge && (
                              <div className="text-gray-700">Fee: {policy.Currency} {policy.CancellationCharge}</div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Room Amenities Card */}
            {prebookData.HotelResult?.Rooms?.Amenities && prebookData.HotelResult.Rooms.Amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Room Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prebookData.HotelResult.Rooms.Amenities.map((amenity: string, index: number) => (
                      <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            {/* Booking Summary Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hotel</span>
                    <span className="font-medium text-sm">{hotelDetails?.HotelName || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{location.state?.checkIn || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{location.state?.checkOut || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Type</span>
                    <span className="font-medium text-sm">{prebookData.HotelResult?.Rooms?.Name || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meal Type</span>
                    <span className="font-medium">{prebookData.HotelResult?.Rooms?.MealType || "N/A"}</span>
                  </div>
                  
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-bold text-lg">
                      {prebookData.HotelResult?.Currency} {prebookData.HotelResult?.Rooms?.TotalFare || "N/A"}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 mt-6">
                    <Button 
                      size="lg" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setShowBookingModal(true)}
                    >
                      Book Now
                    </Button>
                    {/* <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel Booking
                    </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Important Information (Full Width) */}
        {prebookData.HotelResult?.RateConditions && prebookData.HotelResult.RateConditions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
                {prebookData.HotelResult.RateConditions.map((condition: string, index: number) => {
                  // Decode HTML entities
                  const decoded = condition
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"');
                  
                  return (
                    <div key={index} className="pb-3 border-b border-gray-200 last:border-0">
                      <div dangerouslySetInnerHTML={{ __html: decoded }} className="prose prose-sm max-w-none text-gray-700" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setShowBookingModal(false)}
        >
          <div 
            className="bg-background rounded-lg max-w-4xl w-full my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <BookingModal 
              hotelDetails={hotelDetails}
              selectedRoom={prebookData?.HotelResult?.Rooms}
              rooms={location.state?.rooms}
              guests={location.state?.guests}
              adults={location.state?.adults}
              children={location.state?.children}
              childrenAges={location.state?.childrenAges}
              roomGuestsDistribution={location.state?.roomGuests}
              onClose={() => setShowBookingModal(false)}
            />
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setShowCancelModal(false)}
        >
          <div 
            className="bg-background rounded-lg max-w-md w-full animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <CancelModal 
              hotelName={hotelDetails?.HotelName}
              bookingReference={location.state?.bookingCode}
              onClose={() => setShowCancelModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
// /Users/apple/Downloads/NEWFLOW/src/pages/Booking.tsx