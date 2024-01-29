import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  PermissionsAndroid,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CallActionBox from '../../Components/CallActionBox';
import {useSocket} from '../../Components/SocketContext'; // Import the useSocket hook
import {
  ScreenCapturePickerView,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  RTCIceCandidate,
} from 'react-native-webrtc';

const VideoCallingScreen = () => {
  const socket = useSocket();
  const navigation = useNavigation(); // Access the shared socket instance

  const [localStream, setLocalStream] = useState(null);
  const [callerRemoteStream, setCallerRemoteStream] = useState(null);
  const [iceCandidates, setIceCandidates] = useState([]);

  const [callState, setCallState] = useState('Ringing...');

  const route = useRoute();
  const {image, calleeId, callerId, calleeRemoteStream} = route.params;
  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const pc = useRef(new RTCPeerConnection(servers));

  let isVoiceOnly = false;

  const isOfferCreated = useRef(false);

  async function requestCameraAndMicrophonePermissions() {
    try {
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera.',
          buttonPositive: 'OK',
        },
      );

      const audioPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Permission',
          message: 'App needs access to your microphone.',
          buttonPositive: 'OK',
        },
      );

      if (
        cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
        audioPermission === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Camera and microphone permissions granted');
      } else {
        console.log('Camera and microphone permissions denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // Call the function to request permissions
  requestCameraAndMicrophonePermissions();

  useEffect(() => {
    const initiateCall = async () => {
      console.log('initiate call');

      try {
        let mediaConstraints = {
          audio: true,
          video: {
            frameRate: 30,
            facingMode: 'user',
          },
        };

        const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);
        setLocalStream(mediaStream);
        console.log('caller localStream', localStream);

        if (isVoiceOnly) {
          let videoTrack = mediaStream.getVideoTracks()[0];
          videoTrack.enabled = false;
        }
        if (pc.current) {
          // Add the local media stream to the RTCPeerConnection
          mediaStream.getTracks().forEach(track => {
            pc.current.addTrack(track, mediaStream);
          });

          if (pc.current) {
            pc.current.ontrack = event => {
              try {
                console.log('ontrack event fired from caller side');
                if (event.streams && event.streams[0]) {
                  setCallerRemoteStream(event.streams[0]);
                  console.log(
                    'Received remote stream from caller side',
                    event.streams[0],
                  );
                }
              } catch (error) {
                console.error('Error in ontrack event:', error);
              }
            };
          }

          pc.current.onicecandidate = event => {
            if (event.candidate) {
              console.log(
                'Adding ICE candidate in calling screen:',
                event.candidate,
              );
              // Send the ICE candidate to the callee via the signaling server
              socket.emit('caller-ice-candidate', {
                candidate: event.candidate,
                callerId, // The caller's ID
                calleeId, // The callee's ID
              });
            }
          };
        } else {
          console.log('pc is not fully initialized');
        }

        socket.on('callee-ice-candidate', async ({candidate}) => {
          console.log('candidate', candidate);
          try {
            if (pc?.current.connectionState !== 'closed' && candidate) {
              console.log(
                'candidate inside adding in calling screen',
                candidate,
              );

              await pc?.current.addIceCandidate(new RTCIceCandidate(candidate));
              if (candidate === null) {
                // All ICE candidates have been gathered. The remote streams should now be active.
                console.log('Remote streams are active now.');
              }
              console.log(
                'ice candidate added successfully in ongoing call screen',
              );
              setIceCandidates(prevIceCandidates => [
                ...prevIceCandidates,
                candidate,
              ]);
            } else {
              console.log('the connection state and candidate are not present');
            }
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        });
        // Listen for the `pc.onconnectionstatechange` event
        pc.current.onconnectionstatechange = event => {
          // If the peer connection is established
          if (event.target.connectionState === 'connected') {
            // Wait for the local description to be set
            pc.current.onnegotiationneeded = async () => {
              // Get the local description
              const localDescription = await pc.current.getLocalDescription();

              // Set the local description
              await pc.current.setLocalDescription(localDescription);

              // Log or send the local stream
              console.log('on connection state change', localStream);
              // ...
            };
          }
        };

        // Once media stream is obtained, create and send the offer
        if (!isOfferCreated.current) {
          createOffer();
          isOfferCreated.current = true;
        }
      } catch (err) {
        console.log('call could not be started', err.message);
      }
    };

    const createOffer = async () => {
      try {
        // Create an offer
        const offer = await pc.current.createOffer({
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1,
        });
        await pc.current.setLocalDescription(offer);
        console.log('Offer SDP:', offer.sdp);

        socket.emit(
          'offer',
          {
            offer,
            callerId,
            calleeId,
          },
          ack => {
            if (ack.success) {
              console.log('Offer sent successfully');
            } else {
              console.error('Failed to send offer:', ack.error);
              // Handle the error, possibly retry or show an error message
            }
          },
        );
      } catch (error) {
        console.log('offer cant be created', error.message);
      }
    };
    initiateCall();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceOnly]);

  useEffect(() => {
    socket.on('answer', async data => {
      console.log('answer event handled on caller side');
      // Check if the peer connection is initialized
      if (!pc.current) {
        console.error('Peer connection not initialized');
        return;
      }
      // Handle incoming answer
      const remoteAnswer = new RTCSessionDescription(data.answer);
      await pc.current.setRemoteDescription(remoteAnswer);
      setCallState('Accepted...');
      //socket.emit('caller-ready', calleeId);
      //console.log('Answer SDP1234:', remoteAnswer.sdp);
      //console.log('pc.current calling screen', pc.current);
    });
    /*if (localStream && callerRemoteStream) {
      console.log('callerRemote stream', callerRemoteStream);
      navigation.navigate('VideoOnGoingCall', {
        localStream,
        socketId: socket.id,
        callerPc: pc.current,
        //remoteDescription: remoteAnswer,
        callerRemoteStream,
      });
    }*/ // Assuming you have a state to manage remote stream
  }, [calleeId, callerRemoteStream, localStream, navigation, socket]);

  const handleHangUp = () => {
    // Emit the "call hangup" event
    socket.emit('call hangup', {
      calleeId,
      callerId,
    });
    console.warn('hangup');
    navigation.navigate('ChatsScreen'); // Example: Navigate back to the previous screen.
  };
  socket.on('call decline', data => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Close the peer connection
    pc.current?.close();
    setCallState('declined');
    console.warn('Call declined by the callee');
    navigation.navigate('ChatsScreen');
  });

  return (
    <View style={styles.page}>
      <Pressable style={styles.backButton}>
        <Ionicons name="chevron-back" color="white" size={25} />
      </Pressable>
      <View style={styles.header}>
        <Entypo name="lock" color="white" size={24} />
        <Text style={styles.lockText}>End to end encrypted</Text>
      </View>
      <Image source={{uri: image}} style={styles.image} />
      <View style={styles.videoContainer}>
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        )}
      </View>
      <View style={styles.videoContainer}>
        {callerRemoteStream && callState === 'Accepted...' && (
          <RTCView
            streamURL={callerRemoteStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        )}
        {calleeRemoteStream && callState === 'Accepted' && (
          <RTCView
            streamURL={calleeRemoteStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        )}
      </View>

      <Text style={styles.name}>Lukas</Text>
      <Text style={styles.ringing}> {callState} </Text>
      <CallActionBox onHangup={handleHangUp} />
    </View>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  backButton: {
    top: 50,
    left: 10,
    zIndex: 10,
    position: 'absolute',
  },
  header: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  lockText: {
    color: 'white',
    marginLeft: 5,
  },
  name: {
    fontSize: 27,
    color: 'white',
    position: 'absolute',
    marginTop: 80,
    left: 140,
  },
  ringing: {
    fontSize: 20,
    color: 'white',
    position: 'absolute',
    top: 120,
    left: 140,
  },
  videoContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  localVideo: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default VideoCallingScreen;
