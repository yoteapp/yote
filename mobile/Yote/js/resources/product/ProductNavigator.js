/**
 * Navigator for product components
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

// import product components
import CreateProduct from './views/CreateProduct';
import ProductRoot from './views/ProductRoot';
import SingleProduct from './views/SingleProduct';
import UpdateProduct from './views/UpdateProduct';

// horizontal screen transitions
const CardNavigator = createStackNavigator(
  {
    ProductRoot: {
      screen: ProductRoot
    }
    , SingleProduct: {
      screen: SingleProduct
    }
  }
  , {
      headerMode: 'none'
      , initialRouteName: 'ProductRoot'
    }
);

const ProductNavigator = createStackNavigator(
  {
    CardNavigator: {
      screen: CardNavigator
    }
    , CreateProduct: {
      screen: CreateProduct
    }
    , UpdateProduct: {
      screen: UpdateProduct
    }
  }
  , {
      headerMode: 'none'
      , mode: 'modal' // vertical screen transitions
    }
);

export default ProductNavigator;
