import {useRoute, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Pressable,
  PermissionsAndroid,
  SafeAreaView,
} from 'react-native';
import {
  ScreenCapturePickerView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
} from 'react-native-webrtc';
import {useSocket} from '../../Components/SocketContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const VideoIncomingCallScreen = () => {
  const [localStream, setLocalStream] = useState(null);

  const [callAccepted, setCallAccepted] = useState(false);
  const [iceCandidates, setIceCandidates] = useState([]);
  const [calleeRemoteStream, setCalleeRemoteStream] = useState(null);

  const [connectionState, setConnectionState] = useState('disconnected'); // Add connection state
  const route = useRoute();
  const navigation = useNavigation();
  const {callId, calleeId, callerId, image, socketId, room} = route.params;

  let callStatusText = 'Incoming Call';

  // Retrieve the socket using socketId
  const socket = useSocket(socketId);

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
  const callDecline = () => {
    socket.emit('call decline', {
      callerId,
      calleeId,
    });
    navigation.navigate('ChatsScreen');
  };

  useEffect(() => {
    async function requestCameraAndMicrophonePermissions() {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          granted['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log(
            'Camera and microphone permissions granted on callee side',
          );
        } else {
          console.log('Camera and microphone permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
    requestCameraAndMicrophonePermissions();

    async function CalleeStream() {
      // Set up local media stream (video and audio)
      const mediaConstraints = {
        audio: true,
        video: {
          frameRate: 30,
          facingMode: 'user',
        },
      };
      const mediaStream = await mediaDevices.getUserMedia(mediaConstraints);
      setLocalStream(mediaStream);

      // Add the local media stream to the RTCPeerConnection
      mediaStream.getTracks().forEach(track => {
        pc.current.addTrack(track, mediaStream);
      });
      console.log(
        'RTCPeerConnection current state:',
        pc.current.connectionState,
      );
    }

    CalleeStream();

    if (pc.current) {
      pc.current.onnegotiationneeded = async () => {
        console.log('negotiation needed event handled');
      };
    }

    // Assuming 'socket' is your socket connection on the callee side
    if (socket.connected) {
      console.log(
        'The callee(incoming call screen) is connected to the server',
      );
    } else {
      console.log(
        'The callee (incoming call screen) is not connected to the server',
      );
    }
    // Assuming 'socket' is your socket connection on the client side
    console.log(
      'Socket ID on the client side (incoming call screen):',
      socket.id,
    );

    pc.current.ontrack = async event => {
      console.log('ontrack event fired from callee side3456789434567887654');
      try {
        if (event.streams && event.streams[0]) {
          setCalleeRemoteStream(event.streams[0]);
          console.log(
            'Received remote stream from callee side68943356789865434',
            event.streams[0],
          );
        }
      } catch (error) {
        console.error('Error in ontrack event:', error);
      }
    };

    socket.on('offer', async data => {
      try {
        console.log('offer received by callee');

        console.log(
          'Is callee subscribed to offer event?',
          socket.listeners('offer').length,
        );

        //set up the remote description
        await pc.current.setRemoteDescription(
          new RTCSessionDescription(data.offer),
        );

        socket.on('caller-ice-candidate', data => {
          console.log('candidate incoming call screen', data.candidate);
          try {
            // Add the received ICE candidate to the RTCPeerConnection
            pc.current
              .addIceCandidate(new RTCIceCandidate(data.candidate))
              .catch(error => {
                console.error(
                  'Error adding ICE candidate in callee side:',
                  error,
                );
              });
            setIceCandidates(prevIceCandidates => [
              ...prevIceCandidates,
              data.candidate,
            ]);
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        });

        pc.current.onicecandidate = event => {
          if (event.candidate) {
            // Send the ICE candidate to the callee via the signaling server
            socket.emit('callee-ice-candidate', {
              candidate: event.candidate,
              callerId, // The caller's ID
              calleeId, // The callee's ID
              room,
            });
          }
        };
      } catch (e) {
        console.log('error when answering11234567897654323456', e.message);
      }
    });
    // Wait until the caller has started sending their video stream.

    pc.current.onconnectionstatechange = event => {
      console.log(
        'RTCPeerConnection current state:',
        pc.current.connectionState,
      );
      setConnectionState(pc.current.connectionState);
    };

    socket.on('call hangup', data => {
      console.warn('call hanged by caller');
      navigation.navigate('ChatsScreen');
    });

    return () => {
      // Clean up listeners and streams when component unmounts
      socket.off('offer');
      socket.off('ice-candidate');
      socket.off('call hangup');
      //socket.off('room joined');
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const acceptCall = async () => {
    try {
      console.log('call accepted by callee');
      // Set the offer options
      let answerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1,
      };

      const answer = await pc.current.createAnswer(answerOptions);
      await pc.current.setLocalDescription(answer);
      socket.emit('answer', {answer, calleeId, callerId}); // Emit the answer
      setCallAccepted(true);

      console.log('call accepted', callAccepted);

      console.log('localStream2', localStream);
      //setTimeout(() => {
    } catch (e) {
      console.log('error when answering', e.message);
    }
  };
  useEffect(() => {
    console.log('caller ready event received in callee side');
    console.log('callee remotestream before navigating', calleeRemoteStream);
    if (localStream && calleeRemoteStream && callAccepted) {
      console.log('ice candidates in incoming call screen', iceCandidates);
      navigation.navigate('VideoCallingScreen', {
        calleeId,
        callerId,
        callId,
        localStream,
        calleeRemoteStream,
        calleeIceCandidates: iceCandidates,
        calleePc: pc.current,
      });
    }
  }, [
    callAccepted,
    callId,
    calleeId,
    calleeRemoteStream,
    callerId,
    iceCandidates,
    localStream,
    navigation,
    socket,
  ]);

  // Check the `callAccepted` state to determine the text content
  if (callAccepted) {
    callStatusText = 'Call Accepted';
  }

  return (
    <View style={styles.page}>
      <View style={{marginTop: 100}}>
        <Text style={styles.text}> whatsApp Video Call </Text>
      </View>
      <View>
        <Image source={{uri: image}} style={styles.image} />
      </View>
      <Text style={styles.callStatus}>{callStatusText}</Text>
      <View style={styles.videoContainer}>
        {localStream && (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        )}
      </View>

      <View style={styles.BottomIcons}>
        <View style={styles.callEnd}>
          <Pressable pressable onPress={callDecline}>
            <MaterialIcons
              name="call-end"
              size={28}
              color="red"
              style={styles.callEnd}
            />
          </Pressable>
        </View>

        <View>
          <Pressable onPress={acceptCall}>
            <Feather
              name="video"
              size={24}
              color="white"
              style={styles.video}
            />
          </Pressable>
        </View>

        <View>
          <MaterialIcons
            name="message"
            size={20}
            color="white"
            style={styles.message}
          />
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.description}>Decline</Text>
        <Text style={styles.description}>accept</Text>
        <Text style={styles.description}>Message</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 0,
    position: 'absolute',
    zIndex: 1,
  },
  lock: {
    marginVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  name: {
    marginTop: 60,
    padding: 50,
    fontSize: 25,
    alignSelf: 'center',
    color: 'white',
    position: 'absolute',
    zIndex: 1,
  },
  callStatus: {
    fontSize: 20,
    padding: 70,
    alignSelf: 'center',
    marginTop: 70,
    color: 'white',
    position: 'absolute',
    zIndex: 1,
  },
  text: {
    fontSize: 20,
    padding: 90,
    alignSelf: 'center',
    marginTop: 80,
    color: 'white',
    position: 'absolute',
    zIndex: 1,
  },
  BottomIcons: {
    marginTop: 'auto',
    justifyContent: 'space-between',
    padding: 40,
    flexDirection: 'row',
  },
  callEnd: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: 48,
    height: 48,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    backgroundColor: 'skyblue',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    marginBottom: 17,
    color: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  message: {
    backgroundColor: 'skyblue',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 13,
  },
  description: {
    color: 'white',
    fontSize: 15,
    bottom: 10,
  },

  videoContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'pink',
    //zIndex: 9999,
  },
  localVideo: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    //zIndex: 9999,
  },
});

export default VideoIncomingCallScreen;
{
  /*
<Text style={styles.name}>{ }</Text>;
<Image source={'image undefined'} style={styles.image} />;*/
}
