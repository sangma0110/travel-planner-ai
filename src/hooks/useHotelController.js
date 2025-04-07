import { useState } from 'react';
import { HotelService } from '../services/HotelService';

export const useHotelController = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchHotels = async (searchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await HotelService.searchHotels(searchParams);
      setHotels(results);
    } catch (err) {
      setError(err.message);
      console.error('Error searching hotels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const bookHotel = async (hotelId, bookingDetails) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await HotelService.bookHotel(hotelId, bookingDetails);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error booking hotel:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hotels,
    isLoading,
    error,
    searchHotels,
    bookHotel
  };
}; 