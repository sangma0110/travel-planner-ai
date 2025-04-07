import React, { createContext, useContext } from 'react';

const TripContext = createContext();

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children, value }) => {
  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export { TripContext }; 