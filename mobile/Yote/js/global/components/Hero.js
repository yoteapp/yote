// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';

import displayName from '../../'

// import react-native components
import {
  View
  , Text
} from 'react-native'; 

// import global components
import Base from './BaseComponent';
import YTColors from '../styles/YTColors'; 

/**
 * build a temporary component for each "cool thing"
 */

class TheCoolThing extends Base {
  constructor(props){
    super(props);
    this.state = {
      secondsElapsed: 0
      , coolThing: "apps"
      , coolThingIndex: 0
      , coolThingsList : [ "blogs", "dashboards",  "experiments", "products", "art", "apps"]
    };
  }

  tick() {
    var { coolThing, coolThingIndex, coolThingsList, secondsElapsed } = this.state;
    let nextCoolThingIndex;
    if(coolThingIndex == coolThingsList.length - 1) {
      // last one, reset to 0
      nextCoolThingIndex = 0;
    } else {
      // setup the next cool thing
      nextCoolThingIndex = coolThingIndex + 1;
    }
    this.setState({
      secondsElapsed: secondsElapsed + 1
      , coolThing: coolThingsList[coolThingIndex]
      , coolThingIndex: nextCoolThingIndex
    });
  }

  componentDidMount() {
    this.interval = setInterval(this.tick.bind(this), 2200);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
     
    return(
        <Text
          style={{color: YTColors.yoteGreen, fontSize: 25, textAlign: 'center', fontFamily: 'AvenirNextCondensed-DemiBold'}}
          key={this.state.coolThing}
        >
          {this.state.coolThing}
        </Text>
    )
  }
}

/**
 * build and export the landing page Hero banner
 */
class Hero extends Base {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={{flex: 1}}>
          <Text style={{fontSize: 30, textAlign: 'center', padding: 10, fontWeight: '600', fontFamily: 'AvenirNextCondensed-DemiBold'}}>Yote </Text> 
          <TheCoolThing />
          <Text style={{fontSize: 18, textAlign: 'center', padding: 10, fontWeight: 'normal', fontFamily: 'AvenirNextCondensed-DemiBold'}}>Yote is the best super-stack solution out there for any data driven application. You can use it to make cool stuff.</Text>
      </View>
    )
  }
};

export default Hero;
