// import primary libraries
import React from 'react';
// import PropTypes from 'prop-types'; // this component gets no props
import { Link, useLocation, useParams } from 'react-router-dom'

// import global components
import WaitOn from '../../../global/components/helpers/WaitOn';

// import services
// import { useGetProductById } from '../productService';
import { useGetUpdatableProduct } from '../productService';

// import resource components
import ProductLayout from '../components/ProductLayout.jsx'
import { CheckboxInput } from '../../../global/components/forms';

const SingleProduct = () => {
  // get location. Below is equivalent to const location = this.props.location;
  const location = useLocation();

  // get the product id from the url. Below is equivalent to const { productId } = this.props.match.params;
  const { productId } = useParams();

  // get the product from the store (or fetch it from the server)
  // const { data: product, ...productQuery } = useGetProductById(productId);
  // as example of how we can update the product without using the standard form, use the hook to get the product and the stuff needed to update it.
  const { data: product, handleChange, handleSubmit, isChanged, setFormState, sendMutation, resetFormState, ...productQuery } = useGetUpdatableProduct(productId);
  // if you need information stored on `product` to perform other fetches use the examples below
  // NOTE: if any listArg value (`category` in this case) is undefined then the hook will wait to perform the fetch
  // const { data: relatedProducts, ...relatedProductsQuery } = useGetProductList({ category: product?.category })
  // NOTE: if the id is undefined then the hook will wait to perform the fetch
  // const { data: otherResource, ...otherResourceQuery } = useGetOtherResourceById(product?._otherResource);

  // by using the sendMutation function we can essentially patch the product in one go without setting the form state at all
  const handleToggleFeatured = () => {
    sendMutation({ featured: !product.featured }).then(({ payload, error }) => {
      // can do stuff with the response here if needed
    });
  }


  return (
    // <ProductLayout title={'Single Product'}>
    // { productQuery.isLoading ? <Skeleton />
    //   : productQuery.isError ? <div>An error occurred 😬 <button onClick={productQuery.refetch}>Refetch</button></div>
    //   : productQuery.isEmpty ? <div>Empty</div>
    //   :
    //   <div className={productQuery.isFetching ? 'opacity-50' : ''}>
    //     <h1> {product?.title} </h1>
    //     <p> {product?.description}</p>
    //     <Link to={`${location.pathname}/update`}>Update Product</Link>
    //   </div>
    // }
    // </ProductLayout>
    <ProductLayout title={'Single Product'}>
      <div className={`flex flex-col gap-4 max-w-xl ${productQuery.isFetching ? 'opacity-50' : ''}`}>
        <h2>Product details</h2>
        <WaitOn query={productQuery} fallback={<Skeleton />}>
          <h1> {product?.title} </h1>
          <p> {product?.description} </p>
          <CheckboxInput // clicking the checkbox will change the product in the store using the handleChange function
            label='Featured'
            name='featured'
            value={product?.featured || false}
            disabled={!product}
            change={handleChange}
            helpText={product?.featured ? 'This product is featured' : 'This product is not featured'}
          />
          {isChanged && ( // if the product has been changed then show the save button, clicking it will dispatch the update action and save the product on the server
            <div className='flex flex-row gap-4'>
              <button
              className='btn-xs btn-second'
              disabled={productQuery.isFetching}
                onClick={resetFormState}
              >
                Cancel
              </button>
              <button
                className='btn-xs'
                disabled={productQuery.isFetching}
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          )}
        </WaitOn>
        {!isChanged && ( // if the product has not been changed then show the toggle featured button}
          <div className='flex flex-row gap-4'>
            <button
              className='btn-xs btn-second'
              onClick={handleToggleFeatured}
            >
              Toggle Featured
            </button>
            <Link
              className='btn-xs'
              to={`${location.pathname}/update`}>
              Update Product
            </Link>
          </div>
        )}
      </div>
    </ProductLayout>
  )
}

const Skeleton = () => {
  return (
    <div className="animate-pulse">
      <h1 className='bg-gray-600 text-gray-600 w-fit'> Product Title </h1>
      <p className='bg-gray-400 text-gray-400 w-fit'> This is a sample product description </p>
      <CheckboxInput
        label='Featured'
        name='featured'
        value={false}
        disabled={true}
        change={() => { }}
      />
    </div>
  )
}

export default SingleProduct;
