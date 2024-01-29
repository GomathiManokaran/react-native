import {useRoute, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Pressable,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AudioIncomingCallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  return (
    <View style={styles.page}>
      <View style={{marginTop: 100}}>
        <Image source={'image undefined'} style={styles.image} />

        <Text style={styles.name}>{}</Text>
        <Text style={styles.callStatus}>{}</Text>
        <Text style={styles.text}> whatsApp voice call </Text>
      </View>

      <View style={styles.BottomIcons}>
        <View style={styles.callEnd}>
          <Pressable>
            <MaterialIcons
              name="call-end"
              size={28}
              color="red"
              style={styles.callEnd}
            />
          </Pressable>
        </View>

        <View>
          <Pressable>
            <MaterialIcons
              name="call"
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
    backgroundColor: 'violet',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: 'center',
  },
  lock: {
    marginVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  name: {
    marginTop: 10,
    fontSize: 25,
    alignSelf: 'center',
    color: 'white',
  },
  callStatus: {
    fontSize: 20,
    alignSelf: 'center',
    color: 'white',
  },
  text: {
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 10,
    color: 'white',
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
});

export default AudioIncomingCallScreen;
