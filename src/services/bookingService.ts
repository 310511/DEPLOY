// Hotel booking service for final booking API call

import { sendConfirmationEmail } from './confirmationService';

const BOOKING_API_URL = '/api/hotel-book'; // Use proxy server

export interface CustomerName {
  Title: string;
  FirstName: string;
  LastName: string;
  Type: 'Adult' | 'Child';
}

export interface CustomerDetails {
  CustomerNames: CustomerName[];
}

export interface BookingRequest {
  BookingCode: string;
  CustomerDetails: CustomerDetails[];
  BookingType: 'Confirm' | 'Voucher';
  ClientReferenceId: string;
  BookingReferenceId: string;
  PaymentMode: 'Limit' | 'Credit';
  GuestNationality: string;
  TotalFare: number;
  EmailId: string;
  PhoneNumber: number;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  confirmationNumber?: string;
  bookingReferenceId?: string;
  confirmationEmailSent?: boolean;
  confirmationEmailMessage?: string;
  data?: any;
}

// Create customer details from booking form data
export const createCustomerDetails = (
  bookingForm: any, 
  rooms: number = 1, 
  guests: number = 1, 
  additionalGuests: Array<{title: string; firstName: string; lastName: string; type: 'Adult' | 'Child'}> = []
): CustomerDetails[] => {
  const customerDetails: CustomerDetails[] = [];
  
  // Create one customer detail per room
  for (let i = 0; i < rooms; i++) {
    const customerNames = [];
    
    // Add primary guest (adult)
    customerNames.push({
      Title: bookingForm.title || "Mr",
      FirstName: bookingForm.firstName,
      LastName: bookingForm.lastName,
      Type: "Adult"
    });
    
    // Add additional guests using provided data
    additionalGuests.forEach((guest) => {
      customerNames.push({
        Title: guest.title,
        FirstName: guest.firstName,
        LastName: guest.lastName,
        Type: guest.type
      });
    });
    
    customerDetails.push({
      CustomerNames: customerNames
    });
  }
  
  return customerDetails;
};

// Generate client reference ID (timestamp-based with random suffix)
export const generateClientReferenceId = (): string => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${timestamp}#${randomSuffix}`;
};

// Make the final booking API call
export const makeBooking = async (bookingData: BookingRequest, customerId?: string): Promise<BookingResponse> => {
  try {
    console.log('🚀 Making booking API call to:', BOOKING_API_URL);
    console.log('📋 Booking request data:', JSON.stringify(bookingData, null, 2));
    
    const response = await fetch(BOOKING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here
      },
      body: JSON.stringify(bookingData),
    });

    console.log('📥 Booking API response status:', response.status);
    console.log('📥 Booking API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Booking API error response:', errorText);
      throw new Error(`Booking failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Booking API response data:', data);
    
    // Check if the API returned an error status
    // Check for API errors
    if (data.Status && data.Status.Code !== '200' && data.Status.Code !== '201') {
      return {
        success: false,
        message: data.Status.Description || 'Booking failed',
        data: data
      };
    }
    
    // Check if booking status is failed even with 200 status
    if (data.BookingStatus === 'Failed') {
      return {
        success: false,
        message: `Booking failed: ${data.Status?.Description || 'Unknown error'}. Confirmation: ${data.ConfirmationNumber || 'N/A'}`,
        data: data
      };
    }
    
    // Send confirmation email if booking was successful and we have customer ID
    let confirmationEmailSent = false;
    let confirmationEmailMessage = '';
    
    console.log('📧 Confirmation email check - customerId:', customerId, 'confirmationNumber:', data.ConfirmationNumber);
    
    // Send confirmation email if booking was successful
    if (customerId && data.ConfirmationNumber && bookingData.EmailId) {
      console.log('📧 Sending confirmation email to:', bookingData.EmailId);
      console.log('📧 Using customer ID:', customerId);
      console.log('📧 Booking Reference ID:', bookingData.BookingReferenceId);
      try {
        const emailResult = await sendConfirmationEmail(
          customerId, 
          data.ConfirmationNumber, 
          bookingData.EmailId,
          false, // Use customer_id, not client_reference_id
          bookingData.BookingReferenceId // Pass booking reference ID
        );
        confirmationEmailSent = emailResult.success;
        confirmationEmailMessage = emailResult.message;
        console.log('📧 Confirmation email result:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
        confirmationEmailMessage = 'Failed to send confirmation email';
      }
    } else {
      console.log('⚠️ Skipping confirmation email - missing required data');
      console.log('  - customerId:', customerId);
      console.log('  - confirmationNumber:', data.ConfirmationNumber);
      console.log('  - email:', bookingData.EmailId);
      confirmationEmailMessage = 'Confirmation email skipped - missing customer_id';
    }

    return {
      success: true,
      message: 'Booking completed successfully',
      confirmationNumber: data.ConfirmationNumber || 'N/A',
      bookingReferenceId: bookingData.BookingReferenceId,
      confirmationEmailSent,
      confirmationEmailMessage,
      data: data
    };
  } catch (error) {
    console.error('Booking error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Booking failed. Please try again.',
    };
  }
};

// Complete booking flow
export const completeBooking = async (
  bookingCode: string,
  bookingReferenceId: string,
  customerData: any,
  bookingForm: any,
  totalFare: number,
  rooms: number = 1,
  guests: number = 1,
  additionalGuests: Array<{title: string; firstName: string; lastName: string; type: 'Adult' | 'Child'}> = []
): Promise<BookingResponse> => {
  try {
    console.log('🎯 Starting completeBooking function');
    console.log('📋 Input parameters:', {
      bookingCode,
      bookingReferenceId,
      customerData,
      bookingForm,
      totalFare,
      rooms,
      guests
    });
    
    const customerDetails = createCustomerDetails(bookingForm, rooms, guests, additionalGuests);
    const clientReferenceId = generateClientReferenceId();
    
    console.log('👥 Created customer details:', customerDetails);
    console.log('👥 Additional guests:', additionalGuests);
    console.log('🆔 Generated client reference ID:', clientReferenceId);
    
    // Generate a fallback booking code if none provided
    const finalBookingCode = bookingCode === 'default_booking_code' 
      ? `FALLBACK_${Date.now()}` 
      : bookingCode;
    
    // Use Voucher booking type as specified
    const bookingRequest = {
      BookingCode: finalBookingCode,
      PaymentMode: 'Limit',
      CustomerDetails: customerDetails,
      BookingType: 'Voucher', // Use Voucher as specified
      ClientReferenceId: clientReferenceId,
      BookingReferenceId: bookingReferenceId,
      GuestNationality: 'AE',
      TotalFare: totalFare,
      EmailId: bookingForm.email,
      PhoneNumber: parseInt(bookingForm.phone) || 0
    };

    console.log('Making booking with data:', bookingRequest);
    
    // Extract customer ID from customerData if available
    let customerId = customerData?.customer_id || customerData?.id;
    
    // If no customer ID from auth, extract from booking reference ID
    // Format: "customer-uuid#timestamp"
    if (!customerId && bookingReferenceId) {
      const parts = bookingReferenceId.split('#');
      if (parts.length > 0) {
        customerId = parts[0]; // Extract the UUID part before the #
        console.log('🔍 Extracted customer ID from booking reference:', customerId);
      }
    }
    
    console.log('🔍 Final Customer ID for email:', customerId);
    console.log('🔍 Email for confirmation:', bookingForm.email);
    console.log('🔍 Full customerData structure:', JSON.stringify(customerData, null, 2));
    
    const result = await makeBooking(bookingRequest, customerId);
    return result;
  } catch (error) {
    console.error('Complete booking flow error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Booking failed. Please try again.',
    };
  }
};
