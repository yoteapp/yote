/**
 * View component for /products/:productId/update
 *
 * Updates a single product from a copy of the product from the product store
 * 
 */

// import primary libraries
import React, { useState } from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { useParams, useHistory, useLocation } from 'react-router-dom';

// import global components
import Modal from '../../../global/components/base/Modal';
import WaitOn from '../../../global/components/helpers/WaitOn';

// import resource components
import ProductLayout from '../components/ProductLayout.jsx';
import ProductForm from '../components/ProductForm.jsx';

// import services
import { useGetUpdatableProduct } from '../productService';

const UpdateProduct = () => {
  const history = useHistory();
  const location = useLocation();
  const { productId } = useParams() // replaces match.params.productId
  // UI state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Product successfully updated.');

  const { data: product, handleChange, handleSubmit, handleUndoUpdate, resetFormState, setFormState, previousVersion, isChanged, ...productQuery } = useGetUpdatableProduct(productId, {
    // optional, callback function to run after the request is complete
    onResponse: (updatedProduct, error) => {
      if (error || !updatedProduct) {
        setSuccessMessage(error?.message || 'An error occurred.');
        // return alert(error?.message || 'An error occurred.');
      }
      setShowSuccessModal(true);
    }
  });

  const navigateToProduct = () => {
    setShowSuccessModal(false);
    history.replace(`/products/${productId}`, location.state);
  }

  const handleUndoChanges = () => {
    setShowSuccessModal(false);
    setSuccessMessage('Changes undone.');
    handleUndoUpdate && handleUndoUpdate();
  }

  // render UI based on data and loading state
  return (
    // <ProductLayout title={'Update Product'}>
    //   { productQuery.isLoading ? <div>Loading...</div>
    //     : productQuery.isError ? <div>An error occurred 😬 <button onClick={productQuery.refetch}>Refetch</button></div>
    //     : productQuery.isEmpty ? <div>Empty</div>
    //     : // we have the product
    //     <ProductForm
    //       product={product}
    //       cancelLink={`/products/${productId}`}
    //       disabled={productQuery.isFetching}
    //       formTitle="Update Product"
    //       formType="update"
    //       handleSubmit={handleSubmit}
    //     />
    //   }
    // </ProductLayout>

    // <WaitOn/> handles all of the isLoading, isError, etc stuff so we don't have to do the stuff above
    <ProductLayout title={'Update Product'}>
      <WaitOn query={productQuery} fallback={<div>Loading...</div>}>
        <ProductForm
          product={product}
          cancelLink={`/products/${productId}`}
          disabled={productQuery.isFetching}
          formType='update'
          formTitle={'Update Existing Product'}
          handleChange={handleChange}
          isChanged={isChanged}
          handleSubmit={handleSubmit}
        />
        <Modal
          confirmText='Okay'
          closeText='Undo Changes'
          disabled={productQuery.isFetching}
          handleClose={handleUndoChanges}
          handleConfirm={navigateToProduct}
          isOpen={showSuccessModal}
          title={`Product updated!`}
        >
          <div className="flex items-center p-2 mb-2">
            <span>{successMessage}</span>
          </div>
        </Modal>
      </WaitOn>
    </ProductLayout>
  )
}

export default UpdateProduct;


