import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  StatusBar,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSocket} from '../Components/SocketContext';

import * as jwt_decode from 'jwt-decode';
import {decode as atob, encode as btoa} from 'base-64';
//const jwt_decode = require('jwt-decode');

const decodeTokenPayload = token => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token structure');
      return null;
    }
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload;
  } catch (error) {
    console.log('Error decoding token:', error);
    return null;
  }
};

const LoginScreen = () => {
  const socket = useSocket();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('token', token);
        if (token) {
          const decoded = decodeTokenPayload(token);
          if (decoded) {
            const userId = decoded.userId;
            console.log('UserId directly', userId);
            socket.emit('login', userId);
            navigation.navigate('ChatsScreen');
          } else {
            console.log('Token is invalid or could not be decoded.');
          }
        } else {
          console.log('token not found,show the login screen itself');
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    checkLoginStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };
    axios
      .post('http://192.168.211.224:3000/login', user)
      .then(response => {
        console.log(response);
        const token = response.data.token;
        //AsyncStorage.clear();
        AsyncStorage.setItem('authToken', token);
        console.log('token 2', token);
        if (token) {
          // Decode the token to extract user information
          const decoded = decodeTokenPayload(token);
          if (decoded) {
            const userId = decoded.userId;
            console.log('UserId directly', userId);
            socket.emit('login', userId);
            navigation.navigate('ChatsScreen');
          } else {
            console.log('Token is invalid or could not be decoded.');
          }
        }
      })
      .catch(error => {
        Alert.alert('Invalid email or password');
        console.log('Login error', error);
      });
  };
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={30}
        style={{flex: 1}}>
        <View style={styles.page}>
          <View style={styles.center}>
            <Text style={styles.text}>Sign In</Text>
          </View>
          <Text style={styles.email}>Email</Text>
          <TextInput
            value={email}
            onChangeText={text => setEmail(text)}
            style={styles.input}
            placeholder="enter your email"
            placeholderTextColor={'black'}
          />
          <Text style={styles.password}>password</Text>
          <TextInput
            value={password}
            onChangeText={text => setPassword(text)}
            style={styles.input}
            secureTextEntry={true}
            placeholder="enter your password"
            placeholderTextColor={'black'}
          />
          <View style={styles.center}>
            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.login}>LogIn</Text>
            </Pressable>
          </View>
          <View>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.Signup}>Don't have an account?Sign up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {
    alignItems: 'center',
  },
  email: {
    fontSize: 20,
    marginTop: 60,
    color: 'black',
    marginLeft: 20,
  },
  password: {
    fontSize: 20,
    marginLeft: 20,
    color: 'black',
    padding: 5,
  },
  text: {
    marginTop: 40,
    color: 'blue',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 5,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: 'white',
    color: 'black',
    fontSize: 17,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    padding: 5,
  },
  button: {
    backgroundColor: 'blue',
    color: 'white',
    padding: 10,
    width: 200,
    marginVertical: 50,
    borderRadius: 10,
  },
  login: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  Signup: {
    textAlign: 'center',
    color: 'black',
    fontSize: 17,
    bottom: 30,
  },
});

export default LoginScreen;
