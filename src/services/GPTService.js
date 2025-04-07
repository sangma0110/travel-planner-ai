import OpenAI from 'openai';
import { bookingService } from './BookingService';
import { format } from 'date-fns';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

class GptService {
  async generateTravelPlan(planData, hotelData = [], flightData = []) {
    try {
      // Convert the new data structure to match the existing prompt structure
      const formData = {
        destination: planData.destination,
        origin: planData.origin,
        startDate: planData.startDate,
        endDate: planData.endDate,
        preferences: planData.travelTheme || '',
        needsHotel: hotelData.length > 0,
        needsFlight: flightData.length > 0,
        travelers: {
          adults: planData.adults || 1,
          children: planData.children || 0
        }
      };

      // Generate the travel plan prompt
      const prompt = `Please format your response as follows:

1. Trip Overview
Recommended transportation methods
Estimated travel time
Time zone differences (if any)

2. ${formData.destination} Guide
Travel Style recommendations based on ${formData.preferences} theme and group size of ${formData.travelers.adults + formData.travelers.children} people

Suggested Activities: 
[activities]
${formData.travelers.children > 0 ? '- Include child-friendly activities and considerations\n' : ''}

3. Day-by-Day Itinerary

Based on the travel period (${formData.startDate} to ${formData.endDate}), create a full itinerary for each day.

For each day, include the following:
[Day #]
Morning: [activity]
  - Consider arrival time and transportation from arrival point (on Day 1)
Afternoon: [activity]
Evening: [activity]
Recommended Restaurants${formData.travelers.children > 0 ? ' (including family-friendly options)' : ''}  
Estimated Cost (for the group)

4. Travel Tips
Transportation Between Cities
Local transportation in ${formData.destination}${formData.travelers.children > 0 ? ' (including stroller accessibility and family considerations)' : ''}

Essential Items to Pack${formData.travelers.children > 0 ? ' (including child-specific items)' : ''}

Weather Tips

Travel documents needed

Important Safety Notes${formData.travelers.children > 0 ? ' (with special attention to traveling with children)' : ''}

Cultural Tips for ${formData.destination}

${formData.needsHotel ? `5. Accommodation Recommendations in ${formData.destination}
Recommended Areas to Stay

Hotel Options:
${hotelData.length > 0 ? hotelData.map(hotel => `
- ${hotel.name} 
  ${hotel.price.amount} / ${hotel.price.currency}

(Mendatory to add the booking link)Booking Link: [Book Now](${hotel.url})`).join('\n') : 'No hotel options available'}


Special Considerations for ${formData.preferences} theme travelers` : ''}

${formData.needsFlight ? `6. Flight Information:
${flightData.length > 0 ? `
Flight Details:
- Departure: ${flightData[0].segments[0].departure.airport} at ${flightData[0].segments[0].departure.time}
- Arrival: ${flightData[0].segments[0].arrival.airport} at ${flightData[0].segments[0].arrival.time}
Price: ${flightData[0].price.amount} ${flightData[0].price.currency}

(Mendatory to add the booking link)Booking Link: ${flightData[0].bookingLink}` : 'No flight options available'}` : ''}

${formData.needsHotel || formData.needsFlight ? (formData.needsHotel && formData.needsFlight ? '7' : '6') : '5'}. Budget Planning
Transportation between cities
Local transportation
Activities and attractions
Food and dining
Miscellaneous expenses 

Total Cost: [amount]`;

      // Call OpenAI API directly
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional travel planner. Create detailed, practical, and engaging travel itineraries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error in generateTravelPlan:', error);
      throw error;
    }
  }
}

export const gptService = new GptService(); 