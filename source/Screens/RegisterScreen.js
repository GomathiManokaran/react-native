import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {ScrollView} from 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const RegisterScreen = () => {
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const navigation = useNavigation();

  const handleRegister = () => {
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    const user = {
      name: name,
      email: email,
      password: password,
      //confirmPassword: confirmPassword,
    };
    console.log('user', user);
    //send a POST request to the backend API to register the user
    axios
      .post('http://192.168.211.224:3000/register', user) //(for emulator) or for real device axios.post('http://localhost:3000/register', user)

      .then(response => {
        console.log(response);
        Alert.alert(
          'Registration successful',
          'you have been registered successfully',
        );
        navigation.navigate('ChatsScreen');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      })
      .catch(error => {
        Alert.alert('An error occured while registering');
        console.log('registration failed', error);
      });
  };
  return (
    <GestureHandlerRootView style={styles.page}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={30}
        style={styles.page}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View>
              <Text style={styles.text}>Sign Up</Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'black',
                  fontSize: 20,
                  marginTop: 20,
                }}>
                Register to your account
              </Text>
            </View>
            <View>
              <Text style={styles.name}>Name</Text>
              <TextInput
                value={name}
                onChangeText={text => setName(text)}
                style={styles.input}
                placeholder="enter your name"
                placeholderTextColor={'black'}
              />
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
            <Text style={styles.password}>Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              style={styles.input}
              placeholder="confirm your password"
              placeholderTextColor={'black'}
              secureTextEntry={true}
            />
            <View style={styles.center}>
              <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.login}>Register</Text>
              </Pressable>
            </View>
            <View style={styles.center}>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signin}>
                  Already have an account?Sign In
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
  name: {
    marginTop: 50,
    fontSize: 20,
    color: 'black',
    padding: 5,
    marginLeft: 20,
  },
  email: {
    color: 'black',
    fontSize: 20,
    marginLeft: 20,
    padding: 5,
  },
  password: {
    color: 'black',
    fontSize: 20,
    marginLeft: 20,
    padding: 5,
  },
  text: {
    marginTop: 40,
    color: 'blue',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 17,
    color: 'black',
  },
  button: {
    backgroundColor: 'blue',
    color: 'white',
    padding: 10,
    width: 200,
    marginVertical: 40,
    borderRadius: 5,
    bottom: 15,
  },
  login: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
  },
  signin: {
    fontSize: 18,
    bottom: 40,
    color: 'black',
  },
});

export default RegisterScreen;
