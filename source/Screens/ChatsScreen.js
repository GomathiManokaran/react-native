import React from 'react';
import {
  FlatList,
  Pressable,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ChatList from '../Components/ChatList';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import chat from '../../assets/data/chats.json';

const ChatsScreen = () => {
  const navigation = useNavigation();

  return (
    <View>
      <FlatList
        data={chat}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              console.log('Navigating to TextScreen with parameters:', {
                id: item.id,
                name: item.user.name,
              });
              navigation.navigate('TextScreen', {
                id: item.id,
                name: item.user.name,
                image: item.user.image,
              });
            }}>
            <ChatList chat={item} />
          </Pressable>
        )}
      />
      {/* Contacts Icon */}
      <TouchableOpacity
        style={styles.contactsButton}
        onPress={() => navigation.navigate('Contacts')}>
        <FontAwesome5 name="user-friends" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contactsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatsScreen;
