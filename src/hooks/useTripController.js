import { useState, useCallback, useEffect } from 'react';
import { GPTService } from '../services/GPTService';

export const useTripController = () => {
  const [state, setState] = useState({
    destination: '',
    duration: '',
    budget: '',
    purpose: '',
    style: '',
    preferences: [],
    messages: []
  });

  const [tripHistories, setTripHistories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved trips from localStorage
    const savedTrips = localStorage.getItem('tripHistories');
    if (savedTrips) {
      setTripHistories(JSON.parse(savedTrips));
    }
  }, []);

  const processUserInput = useCallback(async (input) => {
    setIsLoading(true);
    try {
      const response = await GPTService.processTravelRequest(input);
      setState(prevState => ({
        ...prevState,
        ...response,
        messages: [
          ...prevState.messages,
          { id: Date.now(), text: input, sender: 'user' },
          { id: Date.now() + 1, text: response.message, sender: 'assistant' }
        ]
      }));
    } catch (error) {
      console.error('Error processing user input:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTrip = (tripData) => {
    const newTrip = {
      id: Date.now(),
      ...tripData,
      createdAt: new Date().toISOString()
    };

    const updatedTrips = [...tripHistories, newTrip];
    setTripHistories(updatedTrips);
    localStorage.setItem('tripHistories', JSON.stringify(updatedTrips));
  };

  const selectTrip = (tripId) => {
    return tripHistories.find(trip => trip.id === tripId);
  };

  const deleteTrip = (tripId) => {
    const updatedTrips = tripHistories.filter(trip => trip.id !== tripId);
    setTripHistories(updatedTrips);
    localStorage.setItem('tripHistories', JSON.stringify(updatedTrips));
  };

  return {
    state,
    isLoading,
    tripHistories,
    processUserInput,
    saveTrip,
    selectTrip,
    deleteTrip
  };
}; 