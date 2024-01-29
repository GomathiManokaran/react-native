import React, {useState} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CallActionBox = ({onHangup}) => {
  return (
    <View style={styles.bottomIcons}>
      <Pressable>
        <Ionicons name="camera-reverse" size={24} color="white" />
      </Pressable>
      <Pressable>
        <Feather name={'camera-off'} size={24} color={'violet'} />
      </Pressable>
      <Pressable>
        <Ionicons name={'mic-off'} size={26} color={'violet'} />
      </Pressable>
      <Pressable onPress={onHangup}>
        <MaterialIcons
          name="call-end"
          size={26}
          color="white"
          style={styles.callEnd}
        />
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  bottomIcons: {
    backgroundColor: 'skyblue',
    marginTop: 'auto',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  callEnd: {
    backgroundColor: 'red',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default CallActionBox;
