import React, {useEffect} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import Navigation from './source/Components/Navigation';
import {SocketProvider} from './source/Components/SocketContext';
import {useSocket} from './source/Components/SocketContext';
import {StatusBar} from 'react-native';
//import io from 'socket.io-client';
import axios from 'axios';

//const socket = io('http://192.168.211.224:3000');

const IncomingCallEventHandler = () => {
  const socket = useSocket();
  const navigation = useNavigation();

  useEffect(() => {
    try {
      socket.on('connect', () => {
        console.log('Connected to server');
        console.log('Client-side socket ID:', socket.id);
      });
      // Assuming 'socket' is your socket connection on the client side

      axios
        .get('http://192.168.211.224:3000/users', {
          params: {
            callerEmail: 'gomathi@gmail.com',
            calleeEmail: 'mano@gmail.com',
          },
        })

        .then(response => {
          console.log('response', response);
          const callerId = response.data.callerId;
          const calleeId = response.data.calleeId;

          console.log('User ID-caller Id :', callerId);
          console.log('User ID-callee Id:', calleeId);

          socket.emit('register-caller', callerId);
          socket.emit('register-callee', calleeId);
          // Now you have the user ID and can use it as needed.
        })
        .catch(error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
        });

      const socketData = {
        // Extract only the necessary data from the socket object
        // For example:
        socketId: socket.id,
        // Add more data as needed
      };

      socket.on('incoming call', async data => {
        console.log('Call initiated with ID in app.js:', data);
        const {callId, calleeId, room} = data;
        // Get the caller's socket ID from the caller-socketId-updated event

        navigation.navigate('VideoIncomingCall', {
          callId: data.callId,
          socketId: socketData,
          calleeId: data.calleeId,
          callerId: data.callerId,
          image: data.image,
          room,
        });
      });

      socket.on('connect_error', error => {
        console.log('Connection Error:', error);
      });

      socket.on('connect_timeout', () => {
        console.log('Connection Timeout');
      });

      socket.on('error', error => {
        console.log('Socket.IO error:', error);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    } catch (e) {
      console.log('error in app.js', e.message);
    }

    // Cleanup the event listener when this component unmounts.
    return () => {
      console.log('unmounted');
      socket.off('connect');
      socket.off('register-caller');
      socket.off('register-callee');
      socket.off('incoming call');
      socket.off('connect_error');
      socket.off('connect_timeout');
      socket.off('error');
      socket.off('disconnect');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return null; // Return null if you don't want to render anything
};

const App = () => {
  return (
    <SocketProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Navigation />
        <IncomingCallEventHandler />
      </NavigationContainer>
    </SocketProvider>
  );
};

export default App;
