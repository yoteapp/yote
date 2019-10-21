/**
* Navigator for user components
*/

// import primary libraries
import React from 'react';
import { connect } from 'react-redux';
import {
  Button
  , Image
  , Text
  , TouchableOpacity
  , View
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

// import user components
import Login from './views/Login'; 
import Profile from './views/Profile'; 
import UpdateProfile from './views/UpdateProfile'; 

const UserNavigator = createStackNavigator(
  {
    Profile: {
      screen: Profile
    }
    , UpdateProfile: {
      screen: UpdateProfile
    }
  }
  , {
      initialRouteName: 'Profile'
      , headerMode: 'none'
      , mode: 'modal' // vertical screen (modal) transitions, comment out for horizontal
    }
);

export default UserNavigator;
