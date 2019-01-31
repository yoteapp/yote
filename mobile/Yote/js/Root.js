/**
* Root component, decides which main navigator to display base on user login
*/

// import primary libraries
import React, { Component } from 'react';
import Binder from './global/Binder';
import { connect } from 'react-redux';

// react-native 
import {
  AppState
  , Platform
  , StatusBar
  , StyleSheet
  , Text
  , View
} from 'react-native'; 

// custom components
import AppNavigator from './global/navigation/AppNavigator'; 
import LoggedOutNavigator from './global/navigation/LoggedOutNavigator'; 

class Root extends Binder {
  constructor(props) {
    super(props);
    this._bind(
      '_handleAppStateChange'
    );
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange(appState) {
    if (appState === 'background') {
     }
  }

  render() {

    /**
     * To make app login gated, simply uncomment lines below.
     * It will look for a valid user token/object in store for access.
     */

    // if (!this.props.isLoggedIn) {
    //   return (
    //     <View style={styles.container}>
    //       <LoggedOutNavigator/>
    //     </View>
    //   );
    // }

    return (
      <View style={styles.container}>
        <AppNavigator/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});


const mapStoreToProps = (store) => {
  return {
    isLoggedIn: store.user.loggedIn.apiToken
  }
}

export default connect(
  mapStoreToProps
)(Root);
