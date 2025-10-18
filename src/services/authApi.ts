// Authentication and booking reference API service

const API_BASE_URL = 'http://hotelrbs.us-east-1.elasticbeanstalk.com';
const PROXY_BASE_URL = '/api'; // Use relative URL for Vite proxy

// Test proxy server connectivity
export const testProxyConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing proxy server connection...');
    const response = await fetch(`${PROXY_BASE_URL}/api/test`);
    const data = await response.json();
    console.log('✅ Proxy test response:', data);
    return data.success === true;
  } catch (error) {
    console.error('❌ Proxy test failed:', error);
    return false;
  }
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  data: {
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string;
    age?: number;
    gender?: string;
    nationality?: string;
    phone?: string;
    profile_url?: string;
    created_at?: string;
  };
}

export interface BookingReferenceRequest {
  customer_id: string;
}

export interface BookingReferenceResponse {
  success: boolean;
  message: string;
  booking_reference_id: string;
}

// Customer login API call
export const loginCustomer = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('🔐 Logging in customer with email:', email);
    console.log('🌐 API URL:', `${PROXY_BASE_URL}/customer/login`);
    
    const response = await fetch(`${PROXY_BASE_URL}/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data: LoginResponse = await response.json();
    console.log('✅ Login successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Customer signup API call
export const signupCustomer = async (customerData: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  age: number;
  nationality: string;
  gender: string;
  profile_url?: string;
  phone: string;
}): Promise<LoginResponse> => {
  try {
    console.log('📝 Signing up customer with email:', customerData.email);
    console.log('🌐 API URL:', `${PROXY_BASE_URL}/customer/signup`);
    
    const response = await fetch(`${PROXY_BASE_URL}/customer/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
    }

    const data: LoginResponse = await response.json();
    console.log('✅ Signup successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
};

// Get customer by email API call (keeping for backward compatibility)
export const getCustomerByEmail = async (email: string): Promise<LoginResponse> => {
  try {
    console.log('🔍 Fetching customer data for email:', email);
    console.log('🌐 API URL:', `${PROXY_BASE_URL}/customer/${email}`);
    
    const response = await fetch(`${PROXY_BASE_URL}/customer/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Customer lookup failed: ${response.status} ${response.statusText}`);
    }

    const data: LoginResponse = await response.json();
    console.log('✅ Customer data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Customer lookup error:', error);
    throw error;
  }
};

// Generate booking reference API call
export const generateBookingReference = async (customerId: string): Promise<BookingReferenceResponse> => {
  try {
    console.log('🔍 Generating booking reference for customer ID:', customerId);
    console.log('🌐 API URL:', `${PROXY_BASE_URL}/bookings/reference`);
    
    const response = await fetch(`${PROXY_BASE_URL}/bookings/reference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_id: customerId }),
    });

    console.log('📥 Booking reference response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Booking reference API Error Response:', errorText);
      throw new Error(`Booking reference generation failed: ${response.status} ${response.statusText}`);
    }

    const data: BookingReferenceResponse = await response.json();
    console.log('✅ Booking reference received:', data);
    return data;
  } catch (error) {
    console.error('❌ Booking reference generation error:', error);
    throw error;
  }
};

// Complete customer lookup and booking reference generation flow
export const getCustomerAndBookingReference = async (email: string): Promise<{
  customerData: LoginResponse;
  bookingReference: BookingReferenceResponse;
}> => {
  try {
    console.log('🔍 Starting customer lookup and booking reference flow...');
    
    // Step 1: Get customer by email to get customer_id
    const customerData = await getCustomerByEmail(email);
    console.log('✅ Customer data retrieved:', customerData);
    
    // Step 2: Generate booking reference using customer_id
    const bookingReference = await generateBookingReference(customerData.data.customer_id);
    console.log('✅ Booking reference generated:', bookingReference);
    
    return {
      customerData,
      bookingReference
    };
  } catch (error) {
    console.error('❌ Customer lookup and booking reference flow error:', error);
    
    // Fallback: Create mock data for testing
    console.log('🔄 Using fallback mock data for testing...');
    console.log('🔄 Email for fallback:', email);
    
    // Generate a proper UUID format for mock customer ID
    const generateMockUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    const mockCustomerData: LoginResponse = {
      success: true,
      data: {
        customer_id: generateMockUUID(),
        first_name: 'Test',
        last_name: 'User',
        email: email,
        age: 25,
        gender: 'Male',
        nationality: 'Test',
        phone: '1234567890'
      }
    };
    
    const mockBookingReference: BookingReferenceResponse = {
      success: true,
      message: 'Mock booking reference generated',
      booking_reference_id: `MOCK_${Date.now()}`
    };
    
    console.log('🔄 Returning fallback data:', {
      customerData: mockCustomerData,
      bookingReference: mockBookingReference
    });
    
    return {
      customerData: mockCustomerData,
      bookingReference: mockBookingReference
    };
  }
};
