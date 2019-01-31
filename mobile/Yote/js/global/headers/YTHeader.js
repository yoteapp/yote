// import react things
import React from 'react';
import PropTypes from 'prop-types'; 
import { connect } from 'react-redux';

// import react-native components
import {
  Dimensions
  , Image
  , ListView
  , Platform
  , StyleSheet
  , Text
  , TouchableOpacity
  , View
} from 'react-native'; 

// import global components
import Binder from '../Binder';

// import Styles
import YTStyles from '../styles/YTStyles'; 

const STATUS_BAR_HEIGHT = (Platform.OS === 'ios' && Dimensions.get('window').height === 812) ? 30 : Platform.OS === 'android' ? 10 : 20;
const HEADER_HEIGHT = 80;
const IMAGE_SIZE = 25;
const FONT = Platform.OS === 'android' ? 'sans-serif-condensed' : 'AvenirNextCondensed-DemiBold';

var styles = StyleSheet.create({
  centerItem: {
    flex: 2
    , alignItems: 'center'
  }
  , header: {
      alignItems: 'center'
      , backgroundColor: YTStyles.colors.header
      , borderBottomWidth: 1
      , borderColor: YTStyles.colors.separator
      , flexDirection: 'row'
      , height: HEADER_HEIGHT
      , justifyContent: 'space-between'
      , paddingTop: Platform.OS == 'ios' ? STATUS_BAR_HEIGHT : 0
    }
  , iconStyle: {
      height: IMAGE_SIZE
      , width: IMAGE_SIZE
      , tintColor: YTStyles.colors.headerText
    }
  , imageStyle: {
      height: IMAGE_SIZE
      , width: IMAGE_SIZE
      , borderRadius: IMAGE_SIZE * 0.5
    }
  , itemText: {
      color: 'white'
      , fontSize: 12
      , letterSpacing: 1
    }
  , itemWrapper: {
      padding: 8
    }
  , leftItem: {
      alignItems: 'flex-start'
      , flex: 1
    }
  , rightItem: {
      alignItems: 'flex-end'
      , flex: 1
    }
  , titleText: {
      color: YTStyles.colors.headerText
      , fontFamily: FONT
      , fontSize: 20
      , fontWeight: '600'
    }
  , toolbar: {
      height: HEADER_HEIGHT - STATUS_BAR_HEIGHT
    }
  , toolbarContainer: {
      paddingTop: STATUS_BAR_HEIGHT
    }
});

class ItemWrapperIOS extends React.Component {
  props: {
    color: string;
    item: Item;
  };

  render() {
    const {item, color} = this.props;
    if (!item) {
      return null;
    }

    let content;
    const {title, icon, layout, onPress, image} = item;
    if ((layout !== 'icon' || layout !== 'image')  && title) {
      content = (
        <Text style={[styles.itemText, {color}]}>
          {title.toUpperCase()}
        </Text>
      );
    } else if (layout === 'image' && image) {
      content = <Image
        source={image}
        resizeMode={"cover"}
        style={styles.imageStyle}
        />;
    } else if (icon) {
      content = <Image source={icon} resizeMode="contain" style={styles.iconStyle}/>;
    }

    return (
      <TouchableOpacity
        accessibilityLabel={title}
        accessibilityTraits="button"
        onPress={onPress}
        style={styles.itemWrapper}>
        {content}
      </TouchableOpacity>
    );
  }
}

class YTHeader extends Binder {
  constructor(props) {
    super(props);
    this.state;
    this._bind(
      '_handleLeftAction'
      , '_handleRightAction'
    );
  }

  _handleLeftAction() {
    console.log("_handleLeftAction");
  }

  _handleRightAction() {
    console.log("_handleRightAction");
  }

  render() {
    const { title, leftItem, rightItem, headerStyle } = this.props;

    const titleColor = 'white';

    let itemsColor = YTStyles.colors.headerText;
    let headerBackground;
    let titleStyle;
    if(headerStyle) {
      itemsColor = headerStyle.itemsColor;
      headerBackground = headerStyle.background;
      titleStyle = headerStyle.title;
    }

    return(
      <View style={[styles.header, headerBackground]}>
        <View style={styles.leftItem}>
          <ItemWrapperIOS
            item={leftItem}
            color={itemsColor}
          />
        </View>
        <View
          accessible={true}
          accessibilityLabel={title}
          accessibilityTraits="header"
          style={[styles.centerItem]}
        >
          <Text style={[styles.titleText, titleStyle]}> {title} </Text>
        </View>
        <View style={styles.rightItem}>
          <ItemWrapperIOS
            item={rightItem}
            color={itemsColor}
          />
        </View>
      </View>
    )
  }
}

YTHeader.propTypes = {
  dispatch: PropTypes.func
  , title: PropTypes.string
}

const mapStateToProps = (state) => {

  return {

  }
}

export default connect(
  mapStateToProps
)(YTHeader);
