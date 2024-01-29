import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Messages = ({messages}) => {
  const isMyMessage = () => {
    return messages.user.id === 'u1';
  };
  const formattedTime = dayjs(messages.createdAt).fromNow(true);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMyMessage() ? '#DCF8C5' : 'white',
          alignSelf: isMyMessage() ? 'flex-end' : 'flex-start',
        },
      ]}>
      <Text style={styles.text}> {messages.text} </Text>
      <Text style={styles.time}>{formattedTime}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
    //shadows
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  time: {
    color: 'grey',
    alignSelf: 'flex-end',
  },
  text: {
    color: 'black',
  },
});
export default Messages;
