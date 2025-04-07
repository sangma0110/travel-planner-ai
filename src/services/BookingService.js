class BookingService {
  async searchHotels(cityName, checkInDate, checkOutDate, adults, children) {
    try {
      // First search for the destination
      const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(cityName)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        console.error('Failed to search destination:', await response.text());
        return [];
      }

      const locations = await response.json();
      console.log('Location search response:', locations);

      if (!locations || !locations.data || locations.data.length === 0) {
        console.error('No destinations found for:', cityName);
        return [];
      }

      // Get the first city result
      const destination = locations.data[0];
      console.log('Selected destination:', destination);

      // Search for hotels
      const hotelsUrl = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_type=city&dest_id=${destination.dest_id}&search_type=city&arrival_date=${checkInDate}&departure_date=${checkOutDate}&adults=${adults}&children=${children || 0}&room_qty=1&page_number=1&price_min=50&price_max=2000&currency_code=USD`;

      console.log('Hotels search URL:', hotelsUrl);

      const hotelsResponse = await fetch(hotelsUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!hotelsResponse.ok) {
        console.error('Failed to search hotels:', await hotelsResponse.text());
        return [];
      }

      const hotelsData = await hotelsResponse.json();
      console.log('Raw hotels data:', hotelsData);
      
      if (!hotelsData.data || !Array.isArray(hotelsData.data.hotels)) {
        console.error('No hotels data found in response');
        return [];
      }

      // Get top 3 hotels
      const top3Hotels = hotelsData.data.hotels.slice(0, 3);
      
      // Get detailed information for each hotel
      const hotelDetailsPromises = top3Hotels.map(hotel => 
        this.getHotelDetails(hotel.hotel_id, checkInDate, checkOutDate, adults, children)
      );

      const hotelDetails = await Promise.all(hotelDetailsPromises);
      
      // Filter out any null results and return the details
      return hotelDetails.filter(detail => detail !== null);

    } catch (error) {
      console.error('Error searching hotels:', error);
      return [];
    }
  }

  async getHotelDetails(hotelId, checkInDate, checkOutDate, adults = 1, children = 0) {
    try {
      const url = `https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails?hotel_id=${hotelId}&arrival_date=${checkInDate}&departure_date=${checkOutDate}&adults=${adults}&children=${children}&room_qty=1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get hotel details with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Hotel details response:', data);

      if (!data.data) {
        console.log('No hotel details found');
        return null;
      }

      // Create hotel data structure with essential information
      const hotelData = {
        name: data.data.hotel_name,
        location: `${data.data.address}, ${data.data.city}, ${data.data.country_trans}`,
        room: data.data.rooms?.[Object.keys(data.data.rooms)[0]]?.name || 'Standard Room',
        dates: {
          checkin: data.data.arrival_date,
          checkout: data.data.departure_date
        },
        price: {
          amount: data.data.composite_price_breakdown?.all_inclusive_amount?.value || 0,
          currency: data.data.composite_price_breakdown?.all_inclusive_amount?.currency || 'EUR',
          local_amount: data.data.composite_price_breakdown?.all_inclusive_amount_hotel_currency?.value || 0,
          local_currency: data.data.composite_price_breakdown?.all_inclusive_amount_hotel_currency?.currency || 'INR'
        },
        url: data.data.url
      };

      return hotelData;
    } catch (error) {
      console.error('Error getting hotel details:', error);
      return null;
    }
  }

  async getFlightLocation(cityName) {
    try {
      const url = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination?query=${encodeURIComponent(cityName)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search flight location');
      }

      const data = await response.json();
      console.log('Flight location search response:', data);

      if (!data.data || data.data.length === 0) {
        console.error('No locations found for:', cityName);
        return null;
      }

      // Find the first airport or city result
      const location = data.data.find(loc => 
        loc.type === 'AIRPORT' || 
        loc.type === 'CITY' ||
        loc.id
      );

      if (location) {
        console.log('Found location:', location);
        return {
          id: location.id,
          type: location.type,
          name: location.name || cityName
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching flight location:', error);
      return null;
    }
  }

  async getFlightDetails(token) {
    try {
      const url = `https://booking-com15.p.rapidapi.com/api/v1/flights/getFlightDetails?token=${token}&currency_code=USD`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get flight details with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Flight details response:', data);

      if (!data.data || !data.data.flightOffers || data.data.flightOffers.length === 0) {
        console.log('No flight details found');
        return null;
      }

      // Extract only the necessary information for GPT service
      const flightOffer = data.data.flightOffers[0];
      const segments = flightOffer.segments || [];

      return {
        price: {
          amount: flightOffer.price?.total || flightOffer.price?.amount || 0,
          currency: flightOffer.price?.currency || 'USD'
        },
        segments: segments.map(segment => ({
          departure: {
            time: segment.departure?.time || segment.departureTime,
            airport: segment.departure?.airport?.name || segment.departureAirport?.name || 'Unknown Airport'
          },
          arrival: {
            time: segment.arrival?.time || segment.arrivalTime,
            airport: segment.arrival?.airport?.name || segment.arrivalAirport?.name || 'Unknown Airport'
          },
          airline: segment.airline?.name || segment.carrier?.name || 'Unknown Airline',
          duration: segment.duration || segment.flightDuration || 'N/A'
        })),
        totalDuration: flightOffer.totalDuration || segments.reduce((total, seg) => total + (seg.duration || 0), 0) || 'N/A',
        stops: segments.length - 1,
        bookingLink: flightOffer.bookingLink || data.data.bookingLink || 'https://www.booking.com/flights'
      };
    } catch (error) {
      console.error('Error getting flight details:', error);
      return null;
    }
  }

  async searchFlights(origin, destination, departureDate, returnDate, adults = 1, children = 0) {
    try {
      console.log('Searching flights with params:', { origin, destination, departureDate, returnDate, adults, children });
      
      // Get location IDs for both origin and destination
      const [originLoc, destinationLoc] = await Promise.all([
        this.getFlightLocation(origin),
        this.getFlightLocation(destination)
      ]);

      console.log('Found locations:', { originLoc, destinationLoc });

      if (!originLoc?.id || !destinationLoc?.id) {
        console.error('Could not find location IDs for:', { origin, destination });
        return [];
      }

      // Format dates to YYYY-MM-DD
      const formattedDepartureDate = new Date(departureDate).toISOString().split('T')[0];
      const formattedReturnDate = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;

      // Construct the search URL with correct parameter names for getMinPrice
      const searchParams = new URLSearchParams({
        fromId: originLoc.id,
        toId: destinationLoc.id,
        departDate: formattedDepartureDate,
        cabinClass: 'ECONOMY',
        currency_code: 'USD'
      });

      if (formattedReturnDate) {
        searchParams.append('returnDate', formattedReturnDate);
      }

      const url = `https://booking-com15.p.rapidapi.com/api/v1/flights/getMinPrice?${searchParams.toString()}`;

      console.log('Searching flights with URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`Flight search failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Flight search response:', data);

      if (!data.data || !Array.isArray(data.data)) {
        console.log('No flights found');
        return [];
      }

      // Find first flight with offsetDays = 0
      const selectedFlight = data.data.find(flight => flight.offsetDays === 0);
      if (!selectedFlight) {
        console.log('No flight found with offsetDays = 0');
        return [];
      }

      // Create flight data structure
      const flightData = {
        price: {
          amount: selectedFlight.priceRounded?.units || selectedFlight.price?.units || 0,
          currency: selectedFlight.priceRounded?.currencyCode || 'USD'
        },
        segments: [{
          departure: {
            time: formattedDepartureDate,
            airport: originLoc.name
          },
          arrival: {
            time: formattedReturnDate || formattedDepartureDate,
            airport: destinationLoc.name
          },
        }],
        bookingLink: 'https://www.booking.com/flights'
      };

      // Return the flight data in an array
      return [flightData];

    } catch (error) {
      console.error('Error searching flights:', error);
      return [];
    }
  }

  async getAirportCode(cityName) {
    try {
      // First try searching with city name
      const cityUrl = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(cityName)}`;
      
      const cityResponse = await fetch(cityUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!cityResponse.ok) {
        throw new Error('Failed to search city');
      }

      const cityData = await cityResponse.json();
      console.log('City search response:', cityData);

      if (cityData.data && cityData.data.length > 0) {
        // Find the first result that has an airport code
        const cityWithAirport = cityData.data.find(location => 
          location.airport_code || 
          location.type === 'AIRPORT' || 
          location.dest_type === 'AIRPORT'
        );

        if (cityWithAirport?.airport_code) {
          console.log('Found airport code from city search:', cityWithAirport.airport_code);
          return cityWithAirport.airport_code;
        }
      }

      // If city search didn't yield an airport, try direct airport search
      const airportUrl = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchAirports?query=${encodeURIComponent(cityName)}`;

      const airportResponse = await fetch(airportUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!airportResponse.ok) {
        throw new Error('Failed to search airports');
      }

      const airportData = await airportResponse.json();
      console.log('Airport search response:', airportData);

      if (airportData.data && airportData.data.length > 0) {
        // Find the main airport for the city
        const mainAirport = airportData.data.find(airport => 
          airport.is_major || 
          airport.type === 'AIRPORT' ||
          airport.iata_code
        ) || airportData.data[0];

        if (mainAirport?.iata_code) {
          console.log('Found airport code from airport search:', mainAirport.iata_code);
          return mainAirport.iata_code;
        }
      }

      // If still no airport found, try alternative search
      const alternativeUrl = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchLocations?query=${encodeURIComponent(cityName)}`;

      const alternativeResponse = await fetch(alternativeUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
        }
      });

      if (!alternativeResponse.ok) {
        throw new Error('Failed to search alternative locations');
      }

      const alternativeData = await alternativeResponse.json();
      console.log('Alternative search response:', alternativeData);

      if (alternativeData.data && alternativeData.data.length > 0) {
        const location = alternativeData.data.find(loc => 
          loc.iata_code || 
          loc.airport_code || 
          loc.code
        );

        if (location) {
          const code = location.iata_code || location.airport_code || location.code;
          console.log('Found airport code from alternative search:', code);
          return code;
        }
      }

      console.error('No airport code found for:', cityName);
      return null;
    } catch (error) {
      console.error('Error getting airport code for', cityName, ':', error);
      return null;
    }
  }
}

export const bookingService = new BookingService(); 