import React, {useLayoutEffect, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  ImageBackground,
  StyleSheet,
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Text,
} from 'react-native';
//import {useSocket} from '../SocketContext';
import bg from '../../assets/images/BG.png';
import messages from '../../assets/data/messages.json';
import Messages from '../Components/Messages';
import InputBox from '../Components/InputBox';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://192.168.211.224:3000');

const HeaderTitle = ({image, name}) => (
  <View style={styles.profile}>
    <Image source={{uri: image}} style={styles.image} />
    <Text style={styles.name}>{name}</Text>
  </View>
);

const initiateCall = ({navigation, image}) => {
  //const socket = useSocket();

  axios
    .get('http://192.168.211.224:3000/users', {
      params: {
        callerEmail: 'gomathi@gmail.com',
        calleeEmail: 'mano@gmail.com',
      },
    })
    .then(response => {
      console.log('GET request to /users successful');
      // Check if the response contains callerId and calleeId

      if (response.data && response.data.callerId && response.data.calleeId) {
        const callerId = response.data.callerId;
        const calleeId = response.data.calleeId;

        // Proceed with using callerID and calleeID
        console.log('Caller ID:', callerId);
        console.log('Callee ID:', calleeId);

        axios
          .post('http://192.168.211.224:3000/call', {
            callerId,
            calleeId,
            image,
          })
          .then(callResponse => {
            const CallId = callResponse.data.answeredCallId;
            // Create a room with the unique call ID
            socket.emit('caller-join-room', {room: CallId, callerId});
            socket.emit('callee-join-room', {room: CallId, calleeId});
            console.log('answeredCall', CallId);

            socket.emit('incoming call', {
              calleeId: calleeId, // callee's ID,
              image: image, // image or additional data,
              callId: CallId,
              callerId: callerId,
              room: CallId,
            });
            console.log(
              'Call initiated event emitted. callerID:',
              callerId,
              'calleeID:',
              calleeId,
              'callID:',
              CallId,
            );
            navigation.navigate('VideoCallingScreen', {
              callerId: callerId,
              calleeId: calleeId,
              image,
              callId: CallId,
              room: CallId,
            });
          });
      }
    });
};
const HeaderRight = ({navigation, selectedMessages, name, image}) => (
  <View style={styles.audioVideo}>
    {!selectedMessages.length && (
      <>
        <Ionicons
          name="videocam"
          size={24}
          color="white"
          onPress={() => initiateCall({navigation, image})}
          style={{marginRight: 25}}
        />
        <Ionicons
          name="call"
          size={24}
          color="white"
          onPress={() =>
            navigation.navigate('AudioCallingScreen', {name, image})
          }
        />
      </>
    )}

    {selectedMessages.length > 0 && (
      <Entypo
        name="forward"
        size={24}
        color="white"
        onPress={() =>
          navigation.navigate('Forward To', {
            selectedMessages: selectedMessages,
          })
        }
        style={{marginLeft: 15}}
      />
    )}
  </View>
);

const TextScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [isSelected, setIsSelected] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const {name, image} = route.params;
  console.log('name', name);

  const handleLongPress = messageId => {
    if (!isSelected) {
      // Only set isSelected to true when it's not already in "selected" mode
      setIsSelected(true);
    }
    // Toggle the messageId in the selectedMessages array
    setSelectedMessages(prevSelectedMessages =>
      prevSelectedMessages.includes(messageId)
        ? prevSelectedMessages.filter(id => id !== messageId)
        : [...prevSelectedMessages, messageId],
    );
  };
  const handlePress = messageId => {
    if (isSelected) {
      setSelectedMessages(prevSelectedMessages =>
        prevSelectedMessages.includes(messageId)
          ? prevSelectedMessages.filter(id => id !== messageId)
          : [...prevSelectedMessages, messageId],
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle name={name} image={image} />,

      headerRight: () => (
        <HeaderRight
          name={name}
          image={image}
          selectedMessages={selectedMessages}
          navigation={navigation}
        />
      ),
    });
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
      style={styles.bg}>
      <ImageBackground source={bg} style={styles.bg}>
        <FlatList
          data={messages}
          renderItem={({item}) => (
            <Pressable
              onLongPress={() => handleLongPress(item.id)}
              onPress={() => handlePress(item.id)}
              style={[
                selectedMessages.includes(item.id) && styles.selectedMessages,
              ]}>
              <Messages messages={item} />
            </Pressable>
          )}
          style={styles.list}
          inverted
        />
      </ImageBackground>
      <InputBox />
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  selectedMessages: {
    backgroundColor: 'rgb(30,190,165)',
    fontSize: 60,
  },
  audioVideo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  image: {
    height: 40,
    width: 40,
    borderRadius: 20,
    right: 25,
  },
  name: {
    fontSize: 20,
    color: 'white',
    right: 20,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
});
export default TextScreen;
