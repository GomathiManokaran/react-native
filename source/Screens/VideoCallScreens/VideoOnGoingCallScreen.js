import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import CallActionBox from '../../Components/CallActionBox';
import {
  RTCView,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
} from 'react-native-webrtc';

import {useSocket} from '../../Components/SocketContext';

const VideoOnGoingCallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [iceCandidates, setIceCandidates] = useState([]);

  const {
    callId,
    calleeId,
    callerId,
    localStream,
    socketId,
    remoteDescription,
    calleeRemoteStream,
    callerRemoteStream,
    calleePc,
    callerPc,
  } = route.params;

  console.log('calleePc ongc', calleePc);
  console.log('callerPc ongc', callerPc);
  console.log('caller remotestream', callerRemoteStream);
  console.log('callee remotestream', calleeRemoteStream);
  // Retrieve the socket using socketId
  const socket = useSocket(socketId);

  useEffect(() => {
    socket.on('callee-ice-candidate', async ({candidate}) => {
      console.log('candidate', candidate);
      try {
        if (callerPc?.connectionState !== 'closed' && candidate) {
          console.log('candidate inside adding in calling screen', candidate);

          await callerPc?.addIceCandidate(new RTCIceCandidate(candidate));
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

    if (calleePc) {
      calleePc.oniceconnectionstatechange = function () {
        console.log(
          'ICE connection state change in callee : ',
          calleePc?.iceConnectionState,
        );
      };
    }
    if (callerPc) {
      callerPc.oniceconnectionstatechange = function () {
        console.log(
          'ICE connection state change in caller: ',
          callerPc?.iceConnectionState,
        );
      };
    }
    console.log('connection state', calleePc?.connectionState);
    console.log('connection state', callerPc?.connectionState);
    if (calleePc) {
      calleePc.onsignalingstatechange = () => {
        console.log('Signaling state change:', calleePc?.signalingState);

        if (
          calleePc?.signalingState === 'stable' &&
          !calleeRemoteStream &&
          !callerRemoteStream
        ) {
          // At this point, the ICE candidate gathering process is complete.
          // Check if the remoteStream variable is still not set, and if so, log a warning message.

          console.warn(
            'Remote stream is still not set after ICE candidate gathering process is complete.',
          );
        }
      };
    }

    console.log('Type of remoteStream in ongc:', typeof callerRemoteStream);
    console.log('Type of remoteStream in ongc:', typeof calleeRemoteStream);
    console.log(
      'Is the callee remote stream active:',
      calleeRemoteStream
        ? calleeRemoteStream.active
        : 'callee remotestream is not active',
    );
    console.log(
      'Is the  caller remote stream active:',
      callerRemoteStream
        ? callerRemoteStream.active
        : 'caller remotestream is not active',
    );

    console.log(
      'Is  callee remoteStream an instance of MediaStream?',
      calleeRemoteStream instanceof MediaStream,
    );
    console.log(
      'Is caller  remoteStream an instance of MediaStream?',
      callerRemoteStream instanceof MediaStream,
    );
    console.log(
      'callee remoteStream.tourl in ongc',
      calleeRemoteStream ? calleeRemoteStream.toURL() : 'Stream is undefined',
    );
    console.log(
      'caller remoteStream.tourl in ongc',
      callerRemoteStream ? callerRemoteStream.toURL() : 'Stream is undefined',
    );

    /*pc.getStats(null)
      .then(report => {
        report.forEach(stats => {
          if (stats.type === 'ssrc' && stats.mediaType === 'video') {
            console.log(
              `Packet loss rate2345678: ${
                stats.packetsLost / stats.packetsSent
              }`,
            );
          }
        });
      })
      .catch(error => {
        console.error(error);
      });*/

    return () => {
      // Clean up the event listener when the component unmounts
      socket.off('callee-ice-candidate');
    };
  }, [
    calleePc,
    calleeRemoteStream,
    callerPc,
    callerRemoteStream,
    socket,
    localStream,
  ]);

  const handleHangUp = () => {
    // Emit the "call hangup" event
    socket.emit('call hangup', {
      calleeId,
      callerId,
    });
    console.warn('hangup');
    navigation.navigate('ChatsScreen'); // Example: Navigate back to the previous screen.
  };

  return (
    <View style={styles.page}>
      {localStream && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
          />
        </View>
      )}

      {(calleeRemoteStream || callerRemoteStream) && (
        <View style={styles.remoteStreamsContainer}>
          {calleeRemoteStream && (
            <RTCView
              style={styles.remoteVideo}
              zOrder={20}
              objectFit="cover"
              streamURL={calleeRemoteStream.toURL()}
            />
          )}

          {callerRemoteStream && (
            <RTCView
              style={styles.remoteVideo}
              zOrder={20}
              objectFit="cover"
              streamURL={callerRemoteStream.toURL()}
            />
          )}
        </View>
      )}

      <CallActionBox onHangup={handleHangUp} />
    </View>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'violet',
  },
  remoteVideoContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  remoteVideo: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  localVideoContainer: {
    flex: 1,
    top: 50,
    width: 300,
    right: 100,
    left: 100,
    height: 200,
    position: 'absolute',
  },
  localVideo: {
    flex: 1,
    backgroundColor: 'yellow',
    top: 100,
    width: 300,
    height: 200,
    left: 100,
    position: 'absolute',
    right: 100,
  },

  cameraOff: {
    color: 'white',
    backgroundColor: 'pink',
  },
});

export default VideoOnGoingCallScreen;
