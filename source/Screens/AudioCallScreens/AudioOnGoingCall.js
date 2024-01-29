import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import CallActionBox from './CallActionBox';
import {Voximplant} from 'react-native-voximplant';

const AudioOnGoingCallScreen = ({isMuted}) => {
  const route = useRoute();
  const navigation = useNavigation();

  return (
    <View style={styles.page}>
      <Image source={'dshfj'} style={styles.image} />
      <Text style={styles.name}>{}</Text>
      <CallActionBox />
    </View>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginTop: 250,
  },
  name: {
    color: 'black',
    fontSize: 25,
    top: 10,
  },
});

export default AudioOnGoingCallScreen;
