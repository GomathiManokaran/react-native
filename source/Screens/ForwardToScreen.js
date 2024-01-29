import React from 'react';
import {View, FlatList, Pressable} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import chats from '../../assets/data/chats.json';
import ContactList from '../Components/ContactList';

const ForwardToScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const selectedMessages = route.params.selectedMessages;
  console.log('SelectedMessages received  ::', selectedMessages);

  const handleContactPress = item => {
    // Pass the selected contact's messages to TextScreen
    navigation.navigate('TextScreen', {
      selectedMessages: item.lastMessage, // Assuming your contact object has a messages property
      name: item.user.name,
    });
  };
  return (
    <View>
      <FlatList
        data={chats}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              handleContactPress(item);
            }}>
            <ContactList chat={item} selectedMessages={selectedMessages} />
          </Pressable>
        )}
      />
    </View>
  );
};

export default ForwardToScreen;
