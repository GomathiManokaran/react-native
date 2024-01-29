import React, {useState} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const InputBox = () => {
  const [newMessage, setNewMessage] = useState('');
  const onSend = () => {
    console.warn('Sending a new  message :', newMessage);
    // Clear the text input field
    setNewMessage('');
  };
  return (
    <View style={styles.container}>
      {/* Icon */}
      <AntDesign name="plus" size={24} color="royalblue" />
      {/* Text Input*/}
      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        style={styles.input}
        placeholder="type a message"
      />
      {/* Icon*/}
      <MaterialIcons
        onPress={onSend}
        style={styles.send}
        name="send"
        size={20}
        color="white"
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'whitesmoke',
    paddingHorizontal: 10,
    alignItems: 'center',
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 50,
    borderColor: 'lightgrey',
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    padding: 5,
    fontSize: 17,
  },
  send: {
    borderRadius: 15,
    backgroundColor: 'royalblue',
    overflow: 'hidden',
    padding: 7,
  },
});

export default InputBox;
