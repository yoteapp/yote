/**
 * Will update the name and description of an already existing product
 */

// import react things
import React from 'react';
import PropTypes from 'prop-types';
import ReactNative from 'react-native';
import { connect } from 'react-redux';

// import react-native components
import {
  Image
  , KeyboardAvoidingView
  , Platform
  , ScrollView
  , StyleSheet
  , Text
  , TextInput
  , TouchableOpacity
  , View
} from 'react-native';

// import global components
import Binder from '../../../global/Binder';
import YTButton from '../../../global/buttons/YTButton';
import YTHeader from '../../../global/headers/YTHeader';

// import libraries
import moment from 'moment';
import _ from 'lodash';

// import actions
import * as productActions from '../productActions'

// import styles
import YTStyles from '../../../global/styles/YTStyles';

class UpdateProduct extends Binder {
  constructor(props) {
    super(props);
    const { product } = this.props.navigation.state.params;
    this.state = {
      isFormValid: false
      , newProductData: product ? product : {}
    }
    this._bind(
      '_closeModal'
      , '_handleAction'
      , '_handleInputChange'
      , '_checkFormValid'
      , '_openLibrary'
    )
  }

  _checkFormValid() {

    var requiredInputs = Object.keys(this.refs).filter((ref) => this.refs[ref].props.isRequired);

    var isValid = true;
    for(var i = 0; i < requiredInputs.length; i++) {

      var theVal = _.get(this.state, requiredInputs[i]);
      if(!theVal || theVal.length < 1) {
        isValid = false;
      }
    }

    this.setState({isFormValid: isValid});
  }

  _handleAction() {
    console.log("_handleAction fired");

    const { dispatch, user } = this.props;
    const { newProductData } = this.state;

    let newProduct = _.cloneDeep(newProductData); 
    if(!this.state.isFormValid) {
      Alert.alert("Whoops", "All fields are required.");
      return;
    }
    dispatch(productActions.sendUpdateProduct(newProduct)).then((res) => {
      dispatch(productActions.invalidateList());
      dispatch(productActions.fetchListIfNeeded());
      this.props.navigation.goBack();
    });
  }

  _closeModal() {
    this.props.navigation.goBack();
  }

  _openLibrary() {
    // this.props.navigator.push({library: true});
  }

  _handleInputChange(e, target) {
    var newState = _.update( this.state, target, function() {
      return e.nativeEvent.text;
    });
    this.setState(newState);
    this._checkFormValid();
  }

  _scrollToInput(e, refName) {
    setTimeout(() => {

      var scrollResponder = this.refs.myScrollView.getScrollResponder();
      // var scrollResponder = scrollView.getScrollRef();
      // console.log("on focus called ", refName);
      var offset = 130;
      // console.log(offset);
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        ReactNative.findNodeHandle(this.refs[refName]),
        offset, // adjust depending on your contentInset
        /* preventNegativeScrollOffset */ true
        // false
      );
    }, 150);
  }

  render() {

    const { navigator, isFetching } = this.props;
    const { newProductData, isFormValid } = this.state;
    const leftItem = {
      title: 'Cancel',
      onPress: this._closeModal
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? "padding" : null}
        contentContainerStyle={{flex:1}}
        style={{flex: 1, backgroundColor: '#fff'}}
      >
        <YTHeader
          leftItem={leftItem}
          navigator={navigator}
          title="Update Product"
        />
        <ScrollView ref="myScrollView" keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" style={[YTStyles.formWrapper]}>
          <View>
            <View style={{padding: 5}}>
              <TextInput
                autoCorrect={true}
                autoFocus={true}
                isRequired={true}
                onFocus={ (e) => this._scrollToInput(e, 'newProductData.title')}
                onChange={ (e) => this._handleInputChange(e, "newProductData.title") }
                onSubmitEditing={(event) => {
                  this.refs['newProductData.description'].focus();
                }}
                placeholder="Title"
                placeholderTextColor={YTStyles.colors.lightText}
                ref="newProductData.title"
                returnKeyType="next"
                style={YTStyles.input}
                underlineColorAndroid={YTStyles.colors.anagada}
                value={this.state.newProductData.title}
              />
            </View>
            <View style={YTStyles.listSeparator}/>
            <View style={{padding: 5}}>
              <TextInput
                autoCorrect={true}
                onFocus={ (e) => this._scrollToInput(e, 'newProductData.description')}
                isRequired={true}
                multiline={true}
                onSubmitEditing={this._handleAction}
                onChange={ (e) => this._handleInputChange(e, "newProductData.description")}
                placeholder="Write a description"
                placeholderTextColor={YTStyles.colors.lightText}
                style={[YTStyles.input, {minHeight: 90}]}
                ref="newProductData.description"
                returnKeyType="go"
                value={this.state.newProductData.description}
              />
            </View>
            <View style={YTStyles.listSeparator}/>
          </View>
          <View style={{paddingHorizontal: 10, paddingVertical: 20}}>
            <YTButton
              caption={isFetching ? "Updating..." : "Update product"}
              isDisabled={!isFormValid || isFetching}
              onPress={this._handleAction}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const mapStoreToProps = (store) => {

  return {
    isFetching: store.product.lists.all.isFetching
    , productMap: store.product.byId
    , selectedProduct: store.product.selected
    , user: store.user.loggedIn.user
  }
}

export default connect(mapStoreToProps)(UpdateProduct);
