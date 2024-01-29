import React, {createContext, useContext} from 'react';
import io from 'socket.io-client';

// Create a context for the socket instance
const SocketContext = createContext();

// Provide the socket instance via a context provider
export const SocketProvider = ({children}) => {
  // Connect to your socket server
  const socket = io('http://192.168.211.224:3000');

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

// Custom hook to access the socket instance
export const useSocket = () => {
  return useContext(SocketContext);
};
