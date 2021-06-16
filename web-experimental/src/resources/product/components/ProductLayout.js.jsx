/**
 * Wraps all Product views in a wrapping container. If you want to give all
 * product views a sidebar for example, you would set that here.
 */

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';

// import global components
// import DefaultLayout from '../../../global/components/layouts/DefaultLayout.js.jsx'; // doesn't exist yet

const ProductLayout = ({...props}) => {
  return (
    <div>
      {props.children}
    </div>
  )
}

export default ProductLayout;
