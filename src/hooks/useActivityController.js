import { useState } from 'react';

export const useActivityController = () => {
  const [activities, setActivities] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchActivities = async (searchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the coordinates for the location
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchParams.location
        )}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Location not found');
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      // Search for activities using Places API
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=tourist_attraction&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const placesData = await placesResponse.json();

      if (placesData.status !== 'OK') {
        throw new Error('Failed to fetch activities');
      }

      // Get detailed information for each place
      const detailedActivities = await Promise.all(
        placesData.results.map(async (place) => {
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,formatted_address,geometry,photos,reviews,opening_hours,website&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
          );
          const detailsData = await detailsResponse.json();
          return {
            id: place.place_id,
            name: detailsData.result.name,
            rating: detailsData.result.rating || 0,
            reviewCount: detailsData.result.reviews?.length || 0,
            address: detailsData.result.formatted_address,
            location: {
              lat: detailsData.result.geometry.location.lat,
              lng: detailsData.result.geometry.location.lng
            },
            image: detailsData.result.photos?.[0]?.getUrl(),
            website: detailsData.result.website,
            bookingLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
          };
        })
      );

      // Generate sample package tours
      const samplePackages = generateSamplePackages(detailedActivities, searchParams.location);

      setActivities(detailedActivities);
      setPackages(samplePackages);
    } catch (error) {
      setError(error.message);
      setActivities([]);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSamplePackages = (activities, location) => {
    // This is a sample implementation. In a real application, you would fetch this data from a backend service.
    return [
      {
        id: 'pkg1',
        name: `${location} Highlights Tour`,
        description: 'Experience the best of what the city has to offer with our comprehensive highlights tour.',
        duration: '2 days',
        price: 299,
        activities: activities.slice(0, 3).map(a => a.name),
        image: 'https://via.placeholder.com/600x400?text=Highlights+Tour'
      },
      {
        id: 'pkg2',
        name: `${location} Cultural Experience`,
        description: 'Immerse yourself in the local culture with visits to historical sites and cultural landmarks.',
        duration: '1 day',
        price: 199,
        activities: activities.slice(3, 6).map(a => a.name),
        image: 'https://via.placeholder.com/600x400?text=Cultural+Experience'
      },
      {
        id: 'pkg3',
        name: `${location} Adventure Package`,
        description: 'Get your adrenaline pumping with this action-packed adventure package.',
        duration: '3 days',
        price: 499,
        activities: activities.slice(6, 9).map(a => a.name),
        image: 'https://via.placeholder.com/600x400?text=Adventure+Package'
      }
    ];
  };

  return {
    activities,
    packages,
    isLoading,
    error,
    searchActivities
  };
}; 