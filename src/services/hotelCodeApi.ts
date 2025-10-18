// API functions for fetching hotel codes dynamically
const PROXY_SERVER_URL = import.meta.env.VITE_PROXY_SERVER_URL || 'http://localhost:3001/api';

const getApiUrl = (endpoint: string) => {
  return `${PROXY_SERVER_URL}${endpoint}`;
};

// Types for API responses
export interface Country {
  Code: string;
  Name: string;
}

export interface City {
  CityCode: string;
  CityName: string;
  CountryCode: string;
}

export interface Hotel {
  HotelCode: string;
  HotelName: string;
  CityCode: string;
  CountryCode: string;
}

export interface CountryListResponse {
  Status: {
    Code: string;
    Message: string;
  };
  CountryList: Country[];
}

export interface CityListResponse {
  Status: {
    Code: string;
    Message: string;
  };
  CityList: City[];
}

export interface HotelCodeListResponse {
  Status: {
    Code: string;
    Message: string;
  };
  HotelList: Hotel[];
}

// API functions
export const getCountryList = async (): Promise<CountryListResponse> => {
  try {
    const response = await fetch(getApiUrl('/CountryList'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🌍 Country list response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching country list:', error);
    throw error;
  }
};

export const getCityList = async (countryCode: string): Promise<CityListResponse> => {
  try {
    const response = await fetch(getApiUrl('/CityList'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ CountryCode: countryCode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🏙️ City list response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching city list:', error);
    throw error;
  }
};

export const getHotelCodeList = async (
  countryCode: string, 
  cityCode: string, 
  isDetailedResponse: boolean = false
): Promise<HotelCodeListResponse> => {
  try {
    const response = await fetch(getApiUrl('/HotelCodeList'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        CountryCode: countryCode,
        CityCode: cityCode,
        IsDetailedResponse: isDetailedResponse
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🏨 Hotel code list response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching hotel code list:', error);
    throw error;
  }
};

// Helper functions
export const getHotelCodesString = (hotels: Hotel[]): string => {
  return hotels.map(hotel => hotel.HotelCode).join(',');
};

export const findCountryCodeByName = (countries: Country[], countryName: string): string | null => {
  const country = countries.find(c => 
    c.CountryName.toLowerCase() === countryName.toLowerCase()
  );
  return country ? country.CountryCode : null;
};

export const findCityCodeByName = (cities: City[], cityName: string): string | null => {
  const city = cities.find(c => 
    c.CityName.toLowerCase() === cityName.toLowerCase()
  );
  return city ? city.CityCode : null;
};
