import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const ContactList = ({chat}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'green'} />
      <Image source={{uri: chat.user.image}} style={styles.image} />
      <View>
        <View>
          <Text numberOfLines={1} style={styles.name}>
            {chat.user.name}
          </Text>
        </View>
        <View>
          <Text numberOfLines={1} style={styles.status}>
            {chat.user.status}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    // borderBottomWidth:StyleSheet.hairlineWidth,
    borderBottomColor: 'grey',
    marginVertical: 5,
    marginHorizontal: 10,
    height: 70,
    flexDirection: 'row',
    flex: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  name: {
    marginVertical: 7,
    fontSize: 16,
    color: 'black',
  },
  status: {
    color: 'grey',
    fontSize: 15,
  },
});

export default ContactList;
