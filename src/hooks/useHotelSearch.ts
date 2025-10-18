import { useState, useCallback } from 'react';
import { searchHotels, HotelSearchParams, HotelResult } from '../services/hotelApi';

export const useHotelSearch = () => {
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: HotelSearchParams): Promise<HotelResult[]> => {
    console.log('🚀 Starting hotel search with params:', params);
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchHotels(params);
      console.log('📊 Received API response:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 HotelResult type:', typeof response.HotelResult);
      console.log('📊 HotelResult is array:', Array.isArray(response.HotelResult));
      
      if (response.Status.Code === '200' || response.Status.Code === 200) {
        // Handle both single hotel and array responses
        const hotels = Array.isArray(response.HotelResult) 
          ? response.HotelResult 
          : response.HotelResult ? [response.HotelResult] : [];
        console.log('✅ Success! Found hotels:', hotels.length);
        console.log('🏨 Hotels data:', hotels);
        console.log('🏨 First hotel:', hotels[0]);
        console.log('🏨 First hotel type:', typeof hotels[0]);
        setHotels(hotels);
        return hotels; // Return the hotels
      } else if (response.Status.Code === '201' || response.Status.Code === 201) {
        console.log('⚠️ No rooms available');
        setError('No available rooms found for your search criteria. Try different dates or destinations.');
        setHotels([]);
        return []; // Return empty array
      } else if (response.Status.Code === '204' || response.Status.Code === 204) {
        console.log('⚠️ No results found');
        setError('No hotels found for your search criteria. Try different dates or destinations.');
        setHotels([]);
        return []; // Return empty array
      } else {
        console.log('❌ API error:', response.Status.Description);
        setError(response.Status.Description || 'Search failed');
        setHotels([]);
        return []; // Return empty array
      }
    } catch (err) {
      console.error('💥 Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHotels([]);
      return []; // Return empty array
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setHotels([]);
    setError(null);
  }, []);

  return {
    hotels,
    loading,
    error,
    search,
    setHotels,
    clearResults,
  };
};
