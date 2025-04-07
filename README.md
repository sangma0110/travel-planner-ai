# Travel Planner AI

An intelligent travel planning application that uses AI to create personalized travel itineraries. The application integrates with real-time hotel and flight booking services to provide a comprehensive travel planning experience.

## Features

- 🎯 Personalized travel itinerary generation using AI
- 🏨 Real-time hotel search and booking via Booking.com API
- ✈️ Flight search and booking integration
- 📅 Day-by-day detailed itinerary
- 💰 Budget planning assistance
- 🎨 Theme-based travel recommendations

## Tech Stack

- React.js
- Material-UI
- Context API for state management
- OpenAI GPT API
- Booking.com API

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/travel-planner-ai.git
\`\`\`

2. Install dependencies:
\`\`\`bash
cd travel-planner-ai
npm install
\`\`\`

3. Create a .env file in the root directory and add your API keys:
\`\`\`
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_BOOKING_API_KEY=your_booking_api_key
\`\`\`

4. Start the development server:
\`\`\`bash
npm start
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/         # Custom React hooks
├── services/      # API and service integrations
├── styles/        # Global styles
├── utils/         # Utility functions
└── views/         # Page components
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
