/**
 * View component for /products/new-with-restriction
 * An example of how we can create a product with a custom restriction
 * Requires a requiredParam that will be checked on the server before creating the product
 * If the requiredParam is not present or does not match the required value, the server will return an error
 */

// import primary libraries
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn.jsx'

// import resource components
import ProductForm from '../components/ProductForm.jsx'
import ProductLayout from '../components/ProductLayout.jsx'

// import services
import { useCreateProductWithRequiredParams } from '../productService.js'

const CreateProductWithRestriction = () => {
  const history = useHistory();
  const location = useLocation();

  // This hook has the same signature as the useCreateProduct hook, but it requires a requiredParam that will be checked on the server before creating the product
  const { data: product, handleChange, handleSubmit, isChanged, ...productQuery } = useCreateProductWithRequiredParams({
    // optional, anything we want to add to the default object
    initialState: {
      // someKey: someValue
    }
    // optional, callback function to run when the server returns the new product
    , onResponse: (newProduct, error) => {
      if(error || !newProduct) {
        alert(error || 'An error occurred.')
        history.replace(`/products/mine`, location.state);
      } else {
        history.replace(`/products/${newProduct._id}`, location.state);
      }
    }
    // this is checked on the server before creating the product
    , requiredParam: 'super-fancy'
    // , requiredParam: 'this-will-fail'
  });

  // render UI based on data and loading state
  return (
    <ProductLayout title={'New Super Fancy Product'}>
      <WaitOn query={productQuery} fallback={<div>Loading...</div>}>
        <ProductForm
          product={product}
          cancelLink='/products'
          disabled={productQuery.isFetching}
          formTitle={'New Super Fancy Product'}
          formType='create'
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isChanged={isChanged}
        />
      </WaitOn>
    </ProductLayout>
  )
}

export default CreateProductWithRestriction
