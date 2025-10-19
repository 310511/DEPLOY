import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  Users, 
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getCustomerAndBookingReference, testProxyConnection, loginCustomer, signupCustomer, generateBookingReference } from '@/services/authApi';
import { completeBooking } from '@/services/bookingService';
import { useAuth } from '@/hooks/useAuth';
import { addBookingToCustomBackend } from '@/services/bookingsApi';

interface BookingModalProps {
  hotelDetails: any;
  selectedRoom: any;
  rooms?: number;
  guests?: number;
  adults?: number;
  children?: number;
  childrenAges?: number[];
  roomGuestsDistribution?: Array<{ adults: number; children: number; childrenAges: number[] }>;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  hotelDetails, 
  selectedRoom, 
  rooms = 1, 
  guests = 1,
  adults = 1,
  children = 0,
  childrenAges = [],
  roomGuestsDistribution = [],
  onClose 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    nationality: '',
    gender: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<{
    customerData: any;
    bookingReference: any;
  } | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: 'Mr'
  });

  // Room-based guest details
  const [roomGuests, setRoomGuests] = useState<Array<{
    roomNumber: number;
    guests: Array<{
      title: string;
      firstName: string;
      lastName: string;
      type: 'Adult' | 'Child';
    }>;
  }>>([]);

  // Initialize room-based guests when component mounts
  useEffect(() => {
    const roomsList = [];
    
    // If we have room distribution from search, use it
    if (roomGuestsDistribution && roomGuestsDistribution.length > 0) {
      roomGuestsDistribution.forEach((room, roomIndex) => {
        const roomGuestsList = [];
        
        // Add adults for this room
        for (let i = 0; i < room.adults; i++) {
          roomGuestsList.push({
            title: 'Mr',
            firstName: '',
            lastName: '',
            type: 'Adult' as const
          });
        }
        
        // Add children for this room
        for (let i = 0; i < room.children; i++) {
          roomGuestsList.push({
            title: 'Master',
            firstName: '',
            lastName: '',
            type: 'Child' as const,
            age: room.childrenAges?.[i] || 0
          });
        }
        
        roomsList.push({
          roomNumber: roomIndex + 1,
          guests: roomGuestsList
        });
      });
    } else {
      // Fallback: distribute guests evenly across rooms
      const guestsPerRoom = Math.ceil(guests / rooms);
      
      for (let roomIndex = 0; roomIndex < rooms; roomIndex++) {
        const roomGuestsList = [];
        const startGuestIndex = roomIndex * guestsPerRoom;
        const endGuestIndex = Math.min(startGuestIndex + guestsPerRoom, guests);
        
        for (let guestIndex = startGuestIndex; guestIndex < endGuestIndex; guestIndex++) {
          roomGuestsList.push({
            title: 'Mr',
            firstName: '',
            lastName: '',
            type: 'Adult' as const
          });
        }
        
        roomsList.push({
          roomNumber: roomIndex + 1,
          guests: roomGuestsList
        });
      }
    }
    
    setRoomGuests(roomsList);
  }, [guests, rooms, adults, children, childrenAges, roomGuestsDistribution]);
  
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    confirmationNumber: string;
    bookingId: string;
    clientReferenceId: string;
    bookingReferenceId: string;
    timestamp: string;
  } | null>(null);

  // Check if user is already authenticated and load their data
  useEffect(() => {
    const loadAuthenticatedUserData = async () => {
      if (isAuthenticated && user) {
        console.log('✅ User is already logged in:', user);
        setIsCheckingAuth(true);
        
        try {
          // Always generate a FRESH booking reference when modal opens
          // This ensures each booking attempt has a unique reference
          console.log('🔍 Generating fresh booking reference for this booking...');
          const bookingRefResult = await generateBookingReference(user.customer_id);
          const bookingReferenceId = bookingRefResult.booking_reference_id;
          
          // Save for this booking session
          localStorage.setItem('booking_reference_id', bookingReferenceId);
          
          console.log('📋 Fresh booking reference generated:', bookingReferenceId);
          
          // Set booking data
          setBookingData({
            customerData: {
              success: true,
              data: user
            },
            bookingReference: {
              success: true,
              message: 'Booking reference loaded',
              booking_reference_id: bookingReferenceId
            }
          });
          
          // Pre-fill booking form with user data
          setBookingForm({
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            title: 'Mr'
          });
          
          // Set success message
          setSuccessMessage(`Welcome back, ${user.first_name}! Ready to complete your booking.`);
          
        } catch (error) {
          console.error('❌ Error loading authenticated user data:', error);
          setErrorMessage('Failed to load user data. Please try again.');
        } finally {
          setIsCheckingAuth(false);
        }
      } else {
        // User not authenticated, show login form
        console.log('ℹ️ User not authenticated, showing login form');
        setIsCheckingAuth(false);
      }
    };
    
    loadAuthenticatedUserData();
  }, [isAuthenticated, user]);
  
  // Test connection when component mounts
  useEffect(() => {
    console.log('🧪 Testing frontend to proxy server connection...');
    
    fetch('/api/test')
      .then(response => {
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        return response.json();
      })
      .then(data => {
        console.log('✅ Success! Proxy server response:', data);
      })
      .catch(error => {
        console.error('❌ Error connecting to proxy server:', error);
        console.error('Error details:', error.message);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log('🚀 Starting login process...');
      console.log('📧 Email being used:', loginForm.email);
      
      // Add a small delay to ensure proxy is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🔐 Calling loginCustomer API...');
      const loginResult = await loginCustomer(loginForm.email, loginForm.password);
      console.log('📋 Login result:', loginResult);
      
      if (loginResult.success) {
        // Generate booking reference for the logged-in customer
        console.log('🔍 Generating booking reference...');
        const bookingResult = await getCustomerAndBookingReference(loginForm.email);
        
        // Store booking data for later use
        setBookingData({
          customerData: {
            success: true,
            data: loginResult.data
          },
          bookingReference: bookingResult.bookingReference
        });
        
        // Pre-fill booking form with customer data
        setBookingForm({
          firstName: loginResult.data.first_name || '',
          lastName: loginResult.data.last_name || '',
          email: loginResult.data.email || loginForm.email,
          phone: loginResult.data.phone || '',
          title: 'Mr' // Default title
        });
        
        setSuccessMessage(`Welcome back, ${loginResult.data.first_name}! Your booking reference is: ${bookingResult.bookingReference.booking_reference_id}`);
        
        // Store token for future use
        if (loginResult.token) {
          localStorage.setItem('authToken', loginResult.token);
        }
      } else {
        setErrorMessage(loginResult.message || 'Login failed');
      }
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('Error details:', error);
      
      // More specific error handling
      if (error.message && error.message.includes('Failed to fetch')) {
        setErrorMessage('Network error. Please check if the server is running.');
      } else {
        setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailOnlyLogin = async (email: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log('🚀 Starting email-only login for:', email);
      
      // Get customer data and booking reference
      const result = await getCustomerAndBookingReference(email);
      
      if (result.customerData.success) {
        // Store booking data for later use
        setBookingData({
          customerData: result.customerData,
          bookingReference: result.bookingReference
        });
        
        // Pre-fill booking form with customer data
        setBookingForm({
          firstName: result.customerData.data.first_name || '',
          lastName: result.customerData.data.last_name || '',
          email: result.customerData.data.email || email,
          phone: result.customerData.data.phone || '',
          title: 'Mr' // Default title
        });
        
        setSuccessMessage(`Welcome back, ${result.customerData.data.first_name}! You can now proceed with your booking.`);
        
        console.log('✅ Email-only login successful:', result);
      } else {
        setErrorMessage('Email not found. Please check your email or sign up first.');
      }
    } catch (error) {
      console.error('❌ Email-only login error:', error);
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      console.log('🚀 Starting signup process...');
      console.log('📧 Email being used:', signupForm.email);
      
      // Add a small delay to ensure proxy is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('📝 Calling signupCustomer API...');
      const signupResult = await signupCustomer({
        first_name: signupForm.firstName,
        last_name: signupForm.lastName,
        email: signupForm.email,
        password: signupForm.password,
        age: signupForm.age || 25,
        nationality: signupForm.nationality || 'Indian',
        gender: signupForm.gender || 'Male',
        profile_url: 'https://example.com/pic.jpg',
        phone: signupForm.phone
      });
      console.log('📋 Signup result:', signupResult);
      
      if (signupResult.success) {
        // Generate booking reference for the new customer
        console.log('🔍 Generating booking reference...');
        const bookingResult = await getCustomerAndBookingReference(signupForm.email);
        
        // Store booking data for later use
        setBookingData({
          customerData: {
            success: true,
            data: {
              customer_id: signupResult.data.customer_id,
              first_name: signupForm.firstName,
              last_name: signupForm.lastName,
              email: signupForm.email,
              age: signupForm.age || 25,
              nationality: signupForm.nationality || 'Indian',
              gender: signupForm.gender || 'Male',
              phone: signupForm.phone
            }
          },
          bookingReference: bookingResult.bookingReference
        });
        
        // Pre-fill booking form with customer data
        setBookingForm({
          firstName: signupForm.firstName,
          lastName: signupForm.lastName,
          email: signupForm.email,
          phone: signupForm.phone,
          title: signupForm.title || 'Mr'
        });
        
        setSuccessMessage(`Welcome, ${signupForm.firstName}! Your account has been created and booking reference is: ${bookingResult.bookingReference.booking_reference_id}`);
        
        // Store token for future use
        if (signupResult.token) {
          localStorage.setItem('authToken', signupResult.token);
        }
      } else {
        setErrorMessage(signupResult.message || 'Signup failed');
      }
      
    } catch (error) {
      console.error('❌ Signup failed:', error);
      console.error('Error details:', error);
      
      // More specific error handling
      if (error.message && error.message.includes('Failed to fetch')) {
        setErrorMessage('Network error. Please check if the server is running.');
      } else {
        setErrorMessage(error.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    console.log('🎯 Complete Booking button clicked!');
    console.log('📋 Booking form data:', bookingForm);
    console.log('📦 Booking data:', bookingData);
    
    // Validate booking form data
    if (!bookingForm.firstName || !bookingForm.lastName || !bookingForm.email || !bookingForm.phone) {
      console.log('❌ Validation failed: Missing required fields');
      setErrorMessage('Please fill in all required fields (First Name, Last Name, Email, Phone).');
      return;
    }

    // Validate all room guests
    for (let roomIndex = 0; roomIndex < roomGuests.length; roomIndex++) {
      const room = roomGuests[roomIndex];
      for (let guestIndex = 0; guestIndex < room.guests.length; guestIndex++) {
        const guest = room.guests[guestIndex];
        if (!guest.firstName || !guest.lastName) {
          console.log(`❌ Validation failed: Missing Room ${room.roomNumber} Guest ${guestIndex + 1} details`);
          setErrorMessage(`Please fill in all details for Room ${room.roomNumber}, Guest ${guestIndex + 1} (First Name, Last Name).`);
          return;
        }
      }
    }

    if (!bookingData) {
      console.log('❌ Validation failed: Missing booking data');
      setErrorMessage('Missing booking data. Please login first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Use selectedRoom data if available, otherwise use hotelDetails
      const roomData = selectedRoom || hotelDetails;
      const bookingCode = roomData?.BookingCode;
      
      if (!bookingCode) {
        throw new Error('No booking code available. Please select a room first.');
      }
      
      const totalFare = parseFloat(roomData?.TotalFare || roomData?.Price || 0);
      
      if (totalFare <= 0) {
        throw new Error('Invalid room price. Please select a valid room.');
      }
      
      console.log('Booking with data:', {
        bookingCode,
        bookingReferenceId: bookingData.bookingReference.booking_reference_id,
        totalFare,
        roomData,
        bookingForm,
        customerData: bookingData.customerData
      });

      console.log('🔍 Customer data being passed to booking service:', JSON.stringify(bookingData.customerData, null, 2));

      const result = await completeBooking(
        bookingCode,
        bookingData.bookingReference.booking_reference_id,
        bookingData.customerData,
        bookingForm, // Use booking form data instead of signup form
        totalFare,
        rooms, // Use actual rooms count
        guests, // Use actual guests count
        roomGuests // Pass room-based guests data
      );

      if (result.success) {
        const confirmationData = {
          confirmationNumber: result.confirmationNumber || 'N/A',
          bookingId: result.data?.BookingId || 'N/A',
          clientReferenceId: result.data?.ClientReferenceId || 'N/A',
          bookingReferenceId: bookingData.bookingReference.booking_reference_id,
          timestamp: new Date().toISOString()
        };
        
        // Save confirmation to state
        setBookingConfirmation(confirmationData);
        
        // ⚡ IMPORTANT: Clear the used booking reference ID so a new one is generated for next booking
        localStorage.removeItem('booking_reference_id');
        console.log('♻️ Cleared used booking reference ID - new one will be generated for next booking');
        
        // 🔄 Generate NEW booking reference for next booking
        if (user?.customer_id) {
          try {
            const newBookingRef = await generateBookingReference(user.customer_id);
            localStorage.setItem('booking_reference_id', newBookingRef.booking_reference_id);
            console.log('✅ Generated new booking reference for next booking:', newBookingRef.booking_reference_id);
          } catch (error) {
            console.error('⚠️ Failed to generate new booking reference, will generate on next booking:', error);
          }
        }
        
        // Save to localStorage for later retrieval (for cancellation)
        const bookingHistory = JSON.parse(localStorage.getItem('booking_history') || '[]');
        bookingHistory.push({
          ...confirmationData,
          hotelName: hotelDetails?.HotelName || 'Unknown Hotel',
          roomName: selectedRoom?.Name || 'Unknown Room',
          totalAmount: totalFare,
          customerEmail: bookingForm.email,
          customerName: `${bookingForm.firstName} ${bookingForm.lastName}`
        });
        localStorage.setItem('booking_history', JSON.stringify(bookingHistory));
        
        console.log('🎉 ======= BOOKING CONFIRMED =======');
        console.log('📋 Confirmation Number:', confirmationData.confirmationNumber);
        console.log('🆔 Booking ID:', confirmationData.bookingId);
        console.log('🔖 Booking Reference ID:', confirmationData.bookingReferenceId);
        console.log('🔗 Client Reference:', confirmationData.clientReferenceId);
        console.log('📧 Email:', bookingForm.email);
        console.log('👤 Guest:', `${bookingForm.firstName} ${bookingForm.lastName}`);
        console.log('🏨 Hotel:', hotelDetails?.HotelName);
        console.log('💰 Total:', totalFare);
        console.log('===================================');
        console.log('💡 Use Booking Reference ID for lookup: ', confirmationData.bookingReferenceId);
        console.log('===================================');
        
        // Add booking details to custom backend
        try {
          console.log('📝 Storing booking details in custom backend...');
          await addBookingToCustomBackend({
            booking_reference_id: confirmationData.bookingReferenceId,
            confirmation_number: confirmationData.confirmationNumber,
            client_reference_id: confirmationData.clientReferenceId,
            customer_id: user?.customer_id || '',
            agency_name: 'TravelPro',
            hotel_code: hotelDetails?.HotelCode || '',
            check_in: new Date().toISOString().split('T')[0], // You should pass actual check-in date
            check_out: new Date().toISOString().split('T')[0], // You should pass actual check-out date
            booking_date: new Date().toISOString(),
            status: 'Confirmed',
            voucher_status: true,
            total_fare: totalFare,
            currency: 'INR',
            no_of_rooms: rooms,
            invoice_number: `INV${Date.now()}`
          });
          console.log('✅ Booking details stored in custom backend successfully');
        } catch (backendError) {
          console.error('⚠️ Failed to store booking in custom backend (non-critical):', backendError);
          // Don't fail the booking if backend storage fails
        }
        
        let successMsg = `✅ Booking confirmed!\n\nConfirmation Number: ${confirmationData.confirmationNumber}\n`;
        successMsg += `Booking ID: ${confirmationData.bookingId}\n`;
        successMsg += `Booking Reference ID: ${confirmationData.bookingReferenceId}\n`;
        successMsg += `\n⚠️ IMPORTANT: Save these numbers for cancellation and verification!`;
        
        // Add confirmation email status
        if (result.confirmationEmailSent) {
          successMsg += `\n\n📧 Confirmation email sent to ${bookingForm.email}`;
        } else if (result.confirmationEmailMessage) {
          successMsg += `\n\n⚠️ ${result.confirmationEmailMessage}`;
        }
        
        setSuccessMessage(successMsg);
        console.log('✅ Full booking result:', result);
      } else {
        setErrorMessage(result.message || 'Booking failed. Please try again.');
        console.error('❌ Booking failed:', result);
      }
    } catch (error) {
      console.error('Booking completion failed:', error);
      setErrorMessage('Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setErrorMessage(null);
    setSuccessMessage(null);
  };


  console.log('🔄 BookingModal render - bookingData:', bookingData);
  console.log('🔄 BookingModal render - bookingForm:', bookingForm);
  
  return (
    <Card className="w-full max-h-[85vh] flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
        <div>
          <CardTitle className="text-xl font-bold">Complete Your Booking</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {hotelDetails?.HotelName}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 overflow-y-auto">
        {/* Selected Room Summary */}
        {selectedRoom && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Selected Room</h4>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedRoom.Name}</p>
                <p className="text-xs text-muted-foreground">{selectedRoom.MealType}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant={selectedRoom.IsRefundable === "true" ? "default" : "destructive"} className="text-xs">
                    {selectedRoom.IsRefundable === "true" ? "Refundable" : "Non-Refundable"}
                  </Badge>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="font-bold text-primary">
                  {hotelDetails?.Currency || 'USD'} {selectedRoom.TotalFare}
                </div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Booking Confirmation Card - Show after successful booking */}
        {bookingConfirmation && (
          <Card className="border-2 border-green-500 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <CheckCircle className="h-6 w-6 mr-2" />
                Booking Confirmed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium">Confirmation Number:</span>
                  <span className="font-bold text-lg text-primary font-mono">
                    {bookingConfirmation.confirmationNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium">Booking ID:</span>
                  <span className="font-mono text-sm">{bookingConfirmation.bookingId}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="font-medium">Booking Reference ID:</span>
                  <span className="font-mono text-sm">{bookingConfirmation.bookingReferenceId}</span>
                </div>
              </div>
              
              <Alert className="bg-yellow-50 border-yellow-300">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Important:</strong> Save these numbers:<br/>
                  • <strong>Confirmation: {bookingConfirmation.confirmationNumber}</strong> - For cancellations<br/>
                  • <strong>Booking Ref: {bookingConfirmation.bookingReferenceId}</strong> - For lookup/verification
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(bookingConfirmation.confirmationNumber);
                      alert('Confirmation number copied to clipboard!');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Copy Confirmation
                  </Button>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(bookingConfirmation.bookingReferenceId);
                      alert('Booking Reference ID copied to clipboard!\nUse this for lookup in Profile → Bookings.');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Copy Booking Ref
                  </Button>
                </div>
                <Button 
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show login only if NOT authenticated and no booking confirmation */}
        {!isAuthenticated && !bookingData && !bookingConfirmation && (
          <>
            {/* Login/Signup Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="First name"
                      className="pl-10"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastname">Last Name</Label>
                  <Input
                    id="signup-lastname"
                    type="text"
                    placeholder="Last name"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-age">Age</Label>
                  <Input
                    id="signup-age"
                    type="number"
                    placeholder="Age"
                    min="18"
                    max="120"
                    value={signupForm.age}
                    onChange={(e) => setSignupForm({ ...signupForm, age: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-gender">Gender</Label>
                  <select
                    id="signup-gender"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={signupForm.gender}
                    onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-nationality">Nationality</Label>
                <Input
                  id="signup-nationality"
                  type="text"
                  placeholder="Enter your nationality"
                  value={signupForm.nationality}
                  onChange={(e) => setSignupForm({ ...signupForm, nationality: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account & Book"}
              </Button>
            </form>
          </TabsContent>

        </Tabs>
          </>
        )}

        {/* Booking Form - Only show after login or if authenticated, and no confirmation yet */}
        {(bookingData || isAuthenticated) && !bookingConfirmation && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Booking Information</h3>
            {console.log('📝 Rendering booking form section, bookingData:', bookingData)}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-title">Title</Label>
                <Select 
                  value={bookingForm.title} 
                  onValueChange={(value) => setBookingForm({...bookingForm, title: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-firstname">First Name *</Label>
                <Input
                  id="booking-firstname"
                  placeholder="Enter first name"
                  value={bookingForm.firstName}
                  onChange={(e) => setBookingForm({...bookingForm, firstName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-lastname">Last Name *</Label>
              <Input
                id="booking-lastname"
                placeholder="Enter last name"
                value={bookingForm.lastName}
                onChange={(e) => setBookingForm({...bookingForm, lastName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-email">Email *</Label>
              <Input
                id="booking-email"
                type="email"
                placeholder="Enter email address"
                value={bookingForm.email}
                onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-phone">Phone Number *</Label>
              <Input
                id="booking-phone"
                type="tel"
                placeholder="Enter phone number"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                required
              />
            </div>

            {/* Room-based Guest Details */}
            {roomGuests.map((room, roomIndex) => (
              <div key={roomIndex} className="space-y-4 pt-6 border-t-2 border-primary/20 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-base text-primary">Room {room.roomNumber} Guests</h3>
                  <Badge variant="outline" className="ml-auto">{room.guests.length} Guest(s)</Badge>
                </div>
                
                {room.guests.map((guest, guestIndex) => (
                  <div key={guestIndex} className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guest {guestIndex + 1} {roomIndex === 0 && guestIndex === 0 && "(Primary)"}
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-type`}>Type *</Label>
                        <Select
                          value={guest.type}
                          onValueChange={(value) => {
                            const updated = [...roomGuests];
                            updated[roomIndex].guests[guestIndex] = {...guest, type: value as 'Adult' | 'Child'};
                            setRoomGuests(updated);
                          }}
                        >
                          <SelectTrigger id={`room-${roomIndex}-guest-${guestIndex}-type`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Adult">Adult</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-title`}>Title</Label>
                        <Select
                          value={guest.title}
                          onValueChange={(value) => {
                            const updated = [...roomGuests];
                            updated[roomIndex].guests[guestIndex] = {...guest, title: value};
                            setRoomGuests(updated);
                          }}
                        >
                          <SelectTrigger id={`room-${roomIndex}-guest-${guestIndex}-title`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Miss">Miss</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-firstname`}>First Name *</Label>
                        <Input
                          id={`room-${roomIndex}-guest-${guestIndex}-firstname`}
                          placeholder="First name"
                          value={guest.firstName}
                          onChange={(e) => {
                            const updated = [...roomGuests];
                            updated[roomIndex].guests[guestIndex] = {...guest, firstName: e.target.value};
                            setRoomGuests(updated);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`room-${roomIndex}-guest-${guestIndex}-lastname`}>Last Name *</Label>
                        <Input
                          id={`room-${roomIndex}-guest-${guestIndex}-lastname`}
                          placeholder="Last name"
                          value={guest.lastName}
                          onChange={(e) => {
                            const updated = [...roomGuests];
                            updated[roomIndex].guests[guestIndex] = {...guest, lastName: e.target.value};
                            setRoomGuests(updated);
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <Button 
              onClick={handleCompleteBooking}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Completing Booking..." : "Complete Booking"}
            </Button>
            {console.log('🔘 Complete Booking button rendered')}
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Your information is secure and encrypted</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingModal;
