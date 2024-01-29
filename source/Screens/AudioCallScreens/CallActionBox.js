import React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CallActionBox = ({onHangupPress, onToggleMicroPhone, isMicrophoneOn}) => {
  return (
    <View style={styles.bottomIcons}>
      <Pressable>
        <MaterialIcons name="volume-up" size={24} color="white" />
      </Pressable>

      <Pressable onPress={onToggleMicroPhone}>
        <Ionicons
          name={isMicrophoneOn ? 'mic' : 'mic-off'}
          size={26}
          color="white"
        />
      </Pressable>
      <Pressable onPress={onHangupPress}>
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
