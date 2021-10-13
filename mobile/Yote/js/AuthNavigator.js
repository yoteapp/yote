import React from 'react';
// import {
//   ActivityIndicator,
//   StatusBar,
//   StyleSheet,
//   View,
//   Text,
// } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useLoggedInUser } from './resources/user/authService';

import TabNavigator from './TabNavigator'; 
import UserLogin from '../js/resources/user/views/UserLogin';
import UserRegister from '../js/resources/user/views/UserRegister'; 

export default function AuthNavigator() {
  // use the hook to get the loggedInUser from the authStore
  const { loggedInUser } = useLoggedInUser(); 
  const AuthStack = createNativeStackNavigator(); 

  return (
    <NavigationContainer>
      <AuthStack.Navigator screenOptions ={{
        headerShown: false
      }}>
        { !loggedInUser ? (
          // No loggedInUser found, user isn't signed in 
          <>
            <AuthStack.Screen
              name="UserLogin"
              component={UserLogin}
              options={{
                title: 'Sign in'
                // When logging out, a pop animation feels intuitive
                // You can remove this if you want the default 'push' animation
                // , animationTypeForReplace: loggedInUser ? 'push' : 'pop'
              }}
            />
            <AuthStack.Screen
              name="UserRegister"
              component={UserRegister}
            />
          </>
        ) : (
          // User is signed in
          <AuthStack.Screen 
            name="TabNavigator" 
            component={TabNavigator}
            options={{
              animationTypeForReplace: 'push'
            }}
          />
        )}
      </AuthStack.Navigator>
    </NavigationContainer>
  )
}


