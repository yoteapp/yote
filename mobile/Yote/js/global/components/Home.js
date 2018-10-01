// import react/redux dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// import react-native components & apis
import {
  Dimensions
  , Image
  , Linking
  , Platform
  , ScrollView
  , StyleSheet
  , Text
  , TouchableOpacity
  , View
} from 'react-native'; 

// import global components
import Base from './BaseComponent';
import Hero from './Hero.js';
import YTColors from '../styles/YTColors';
import YTHeader from './YTHeader';
import YTStyles from '../styles/YTStyles'; 

const screenHeight = Dimensions.get('window').height

var styles = StyleSheet.create({
  _bannerWrapper: {
    flex:1
    , padding: 20
    , justifyContent: 'flex-end'
  }
  , _bannerText: {
      color: '#fffFFF'
    }
  , _bannerLabel: {
      fontSize: 18
    }
  , _bannerTitle: {
      fontSize: 38
      , fontWeight: "500"
    }
  , caption: {
      fontSize: 12,
      color: YTColors.lightText
    }
  , cell: {
      flex: 1
      , backgroundColor: 'transparent'
      , marginTop: 10
      , marginBottom: 10
    }
  , comment: {
      backgroundColor: '#fff'
      , padding: 10
      , margin: 5
      , flex: 0.75
      , justifyContent: 'space-between'
    }
  , container: {
      flex: 1
      , backgroundColor: '#fff'
    }
  , details: {
      height: 52
      , textAlign: 'center'
      , fontWeight: '500'
      , flex: 1
      , fontSize: 17
      , paddingTop: 8
      , paddingBottom: 8
    }
  , emptyMessage: {
      fontSize: 16
      , flex: 1
      , textAlign: 'center'
      , color: "#fff"
      , padding: 4
      , marginTop: 40
      , fontStyle: "italic"
      , color: YTColors.lightText
    }
  , header: {
      fontSize: 16
      , textAlign: 'center'
      , color: "#fff"
      , padding: 4
      , color: YTColors.darkText
    }
  , infoBox: {
      padding: 8
    }
  , input: {
      height: 80
      , fontSize: 17
      , padding: 4
      , backgroundColor: YTColors.listSeparator
    }
  , instructions: {
      color: YTColors.lightText
      , textAlign: 'center'
      , marginBottom: 5
    }
  , _squadListSeparator: {
      height: 0
    }
  , scrollView: {
      marginBottom: 50
    }
});


class Home extends Base {
  constructor(props) {
    super(props);
    this._bind(
     '_openProfile'
     ,'_handleOpenDrawer'
     , '_handleClick'
    );
  }

  _openProfile() {
    this.props.navigation.navigate('Profile');
  }

  _handleOpenDrawer() {
    this.context.openDrawer();
  }

  _handleClick() {
    let url = "https://fugitivelabs.github.io/yote/";
    Linking.canOpenURL(url).then(supported => {
      if(supported) {
        Linking.openURL(url);
      } else {
        // console.log("Can't open link");
      }
    })
  }

  render() {

    const {  itemList, navigator, user } = this.props;

    return (
      <View style={[styles.container]}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
        >
          <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 30}} >
            <View style={{backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Image
                  resizeMode={'contain'}
                  source={require('../img/logo.png')}
                  style={{height: 250, width: 250, tintColor: YTColors.yoteDarkBlue}}
                />
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Hero/>
              </View>
            </View>
            <View style={{flex: 1, justifyContent: 'center', paddingTop: 40}}>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={YTStyles.darkText}>A product by</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Image
                  resizeMode={'contain'}
                  source={require('../img/flab-banner-logo-red.png')}
                  style={{height: 35, width: 300}}
                />
              </View>
            </View>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <View style={{flexDirection: 'row', justifyContent: 'center', paddingVertical: 40}}>
                <Text style={{fontFamily: 'AvenirNextCondensed-DemiBold', fontWeight: 'normal', fontSize: 15, color: YTColors.darkText, textAlign: 'center'}}> Check out the docs on </Text>
                <TouchableOpacity
                  onPress={this._handleClick}>
                  <Text style={{fontFamily: 'AvenirNextCondensed-DemiBold', fontWeight: 'normal', fontSize: 15, textAlign: 'center', color: YTColors.yoteDarkBlue}}>Github </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

Home.propTypes = {
  dispatch: PropTypes.func
}

const mapStoreToProps = (store) => {

  /****
  APPLY  sortBy
  ****/

  /****
  APPLY ANY FILTERS
  ****/

  return {
    user: store.user
  }
}

export default connect(
  mapStoreToProps
)(Home);
// export default Home;
