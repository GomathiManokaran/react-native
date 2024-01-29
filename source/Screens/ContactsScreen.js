import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, TextInput, Pressable} from 'react-native';
import chat from '../../assets/data/chats.json';
import ContactList from '../Components/ContactList';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ContactsScreen = ({navigation}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(chat);
  const [showSearchInput, setShowSearchInput] = useState(false); // Track whether to show the search input

  const toggleSearchInput = () => {
    setShowSearchInput(prev => {
      const newValue = !prev; // Calculate the new value
      console.log('New search input state:', newValue); // Log the new value
      return newValue; // Return the new value to update the stat
    }); // Toggle the state
  };

  useEffect(() => {
    const newContacts = chat.filter(contact =>
      contact.user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredContacts(newContacts);
  }, [searchTerm]);

  // Set header options using navigation.setOptions() inside the component's body
  useEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <MaterialIcons
          name={showSearchInput ? 'close' : 'search'}
          size={24}
          color="white"
          onPress={toggleSearchInput}
        />
      ),

      headerTitle: showSearchInput ? (
        <TextInput
          style={{color: 'white', marginRight: 10}}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search a name"
        />
      ) : null,
    });
  }, [showSearchInput, searchTerm, navigation]);

  console.log('show', showSearchInput);

  return (
    <View>
      {showSearchInput && (
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Type a name"
        />
      )}

      <FlatList
        data={filteredContacts}
        renderItem={({item}) => (
          <Pressable
            onPress={() => {
              navigation.navigate('TextScreen', {
                id: item.id,
                name: item.user.name,
                image: item.user.image,
              });
            }}>
            <ContactList chat={item} />
          </Pressable>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  input: {
    fontSize: 20,
    marginVertical: 5,
    marginBottom: 5,
  },
});

export default ContactsScreen;
