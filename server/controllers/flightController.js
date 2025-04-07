const Amadeus = require('amadeus');
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, children, infants, travelClass } = req.body;

    // Amadeus API를 사용하여 항공권 검색
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      returnDate: returnDate,
      adults: adults,
      children: children,
      infants: infants,
      travelClass: travelClass,
      max: 10 // 최대 10개의 결과만 가져옴
    });

    // 응답 데이터를 프론트엔드에 맞게 변환
    const flights = response.data.map(offer => {
      const itinerary = offer.itineraries[0];
      const segment = itinerary.segments[0];
      
      return {
        airline: segment.carrierCode,
        flightNumber: segment.number,
        departureTime: segment.departure.at,
        arrivalTime: segment.arrival.at,
        duration: segment.duration,
        price: offer.price.total,
        travelClass: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
        offerId: offer.id // 예약에 필요한 offer ID 추가
      };
    });

    res.json({ flights });
  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).json({ error: 'Failed to search flights' });
  }
};

exports.bookFlight = async (req, res) => {
  try {
    const { flight, passengerDetails } = req.body;

    // Amadeus API를 사용하여 항공권 예약
    const response = await amadeus.booking.flightOrders.post({
      data: {
        type: 'flight-order',
        flightOffers: [{
          id: flight.offerId,
          price: flight.price,
          travelerPricings: [{
            travelerId: '1',
            fareDetailsBySegment: [{
              segmentId: '1',
              cabin: flight.travelClass
            }]
          }]
        }],
        travelers: [{
          id: '1',
          dateOfBirth: '1982-01-16',
          name: {
            firstName: passengerDetails.firstName,
            lastName: passengerDetails.lastName
          },
          gender: 'MALE',
          contact: {
            emailAddress: passengerDetails.email,
            phones: [{
              deviceType: 'MOBILE',
              countryCallingCode: '33',
              number: passengerDetails.phone
            }]
          },
          documents: [{
            documentType: 'PASSPORT',
            birthPlace: 'Madrid',
            issuanceLocation: 'Madrid',
            issuanceDate: '2015-04-14',
            number: passengerDetails.passportNumber,
            expiryDate: passengerDetails.passportExpiry,
            issuanceCountry: 'ES',
            validityCountry: 'ES',
            nationality: 'ES',
            holder: true
          }]
        }]
      }
    });

    // 예약 성공 시 예약 번호 반환
    res.json({
      bookingReference: response.data.id,
      message: 'Flight booked successfully'
    });
  } catch (error) {
    console.error('Error booking flight:', error);
    res.status(500).json({ error: 'Failed to book flight' });
  }
}; 