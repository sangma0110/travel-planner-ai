import { useState } from 'react';
import { AmadeusService } from '../services/AmadeusService';

export const useFlightController = () => {
  const [flights, setFlights] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchLocations = async (keyword) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await AmadeusService.searchLocations(keyword);
      setLocations(results);
      return results;
    } catch (err) {
      setError(err.message);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchFlights = async (searchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await AmadeusService.searchFlights(searchParams);
      
      // Enhance flight data with airline names
      const enhancedResults = await Promise.all(
        results.map(async (flight) => {
          const carrierCodes = new Set(
            flight.itineraries
              .flatMap(it => it.segments)
              .map(segment => segment.carrierCode)
          );
          
          const airlineNames = {};
          for (const code of carrierCodes) {
            airlineNames[code] = await AmadeusService.getAirlineName(code);
          }

          return {
            ...flight,
            itineraries: flight.itineraries.map(it => ({
              ...it,
              segments: it.segments.map(segment => ({
                ...segment,
                airlineName: airlineNames[segment.carrierCode]
              }))
            }))
          };
        })
      );

      setFlights(enhancedResults);
      return enhancedResults;
    } catch (err) {
      setError(err.message);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    flights,
    locations,
    isLoading,
    error,
    searchFlights,
    searchLocations
  };
}; 