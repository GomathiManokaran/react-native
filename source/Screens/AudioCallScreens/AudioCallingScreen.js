import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CallActionBox from './CallActionBox';

const AudioCallingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  return (
    <View style={styles.page}>
      <Pressable style={styles.backButton}>
        <Ionicons name="chevron-back" color="white" size={25} />
      </Pressable>
      <Image source={'image undefined'} style={styles.image} />

      <Text style={styles.name}>{route.params.name}</Text>
      <Text style={styles.ringing}> {} </Text>
      <CallActionBox />
    </View>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'pink',
  },
  backButton: {
    top: 50,
    left: 10,
    zIndex: 10,
    position: 'absolute',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: 'center',
    marginTop: 100,
  },
  name: {
    fontSize: 27,
    color: 'white',
    position: 'absolute',
    alignSelf: 'center',
    top: 215,
  },
  ringing: {
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
    top: 50,
  },
});

export default AudioCallingScreen;
