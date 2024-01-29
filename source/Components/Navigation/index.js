import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ChatsScreen from '../../Screens/ChatsScreen';
import TextScreen from '../../Screens/TextScreen';
import ContactsScreen from '../../Screens/ContactsScreen';
import ForwardToScreen from '../../Screens/ForwardToScreen';
import VideoCallingScreen from '../../Screens/VideoCallScreens/VideoCallingScreen';
import AudioCallingScreenScreen from '../../Screens/AudioCallScreens/AudioCallingScreen';
import VideoIncomingCallSCreen from '../../Screens/VideoCallScreens/VideoIncomingCallScreen';
import AudioIncomingCallScreen from '../../Screens/AudioCallScreens/AudioIncomingCall';
import VideoOnGoingCallScreen from '../../Screens/VideoCallScreens/VideoOnGoingCallScreen';
import AudioOnGoingCallScreen from '../../Screens/AudioCallScreens/AudioOnGoingCall';
import RegisterScreen from '../../Screens/RegisterScreen';
import LoginScreen from '../../Screens/LoginScreen';

const stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const ChatsStatusCallsScreen = () => {
  return (
    <Tab.Navigator
      initialRouteName="Chats"
      screenOptions={{cd
        tabBarLabelStyle: {
          fontSize: 20,
          color: 'white',
          marginTop: 50,
          textTransform: 'none',
          flexDirection: 'row',
        },
        indicatorStyle: {
          height: 4,
        },
        tabBarItemStyle: {
          backgroundColor: 'green',
        },
      }}>
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{tabBarLabel: 'Chats'}}
      />
      {/* <Tab.Screen
        name="Status"
        component={StatusScreen}
        options={{tabBarLabel: 'Status'}}
      />
      <Tab.Screen
        name="Calls"
        component={CallScreen}
        options={{tabBarLabel: 'Calls'}}
      /> */}
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <stack.Navigator>
      <stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{headerShown: false}}
      />

      <stack.Screen
        name="ChatsScreen"
        component={ChatsStatusCallsScreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={() => ({
          headerStyle: {
            backgroundColor: 'green',
          },
          headerTitleStyle: {
            fontSize: 22,
            color: 'white',
          },
          headerTintColor: 'white',
        })}
      />
      <stack.Screen name="Forward To" component={ForwardToScreen} />
      <stack.Screen
        name="TextScreen"
        component={TextScreen}
        options={() => ({
          headerStyle: {
            backgroundColor: 'green',
          },

          headerTitleStyle: {
            fontSize: 22,
            color: 'white',
          },
          headerTintColor: 'white',
        })}
      />
      <stack.Screen
        name="AudioCallingScreen"
        component={AudioCallingScreenScreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="AudioIncomingCall"
        component={AudioIncomingCallScreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="AudioOnGoingCall"
        component={AudioOnGoingCallScreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="VideoCallingScreen"
        component={VideoCallingScreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="VideoIncomingCall"
        component={VideoIncomingCallSCreen}
        options={{headerShown: false}}
      />
      <stack.Screen
        name="VideoOnGoingCall"
        component={VideoOnGoingCallScreen}
        options={{headerShown: false}}
      />
    </stack.Navigator>
  );
};

export default Navigation;
