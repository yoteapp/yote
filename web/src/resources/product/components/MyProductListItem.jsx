// an example of a component using a custom update endpoint

// import primary libraries
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// import global components

// import services
import { useProductFromMap, useUpdateProductByLoggedInUser } from '../productService';


const MyProductListItem = ({ id }) => {
  const product = useProductFromMap(id);
  // get the custom update action
  const { sendUpdateProduct } = useUpdateProductByLoggedInUser({ id })
  
  const handleToggleFavorite = () => {
    // call the custom update action with our allowed updates
    sendUpdateProduct({ userFavorite: !product.userFavorite }).then(({ payload: updatedProduct, error }) => {
      if(error) {
        alert('An error occurred while updating the product');
      } else {
        // can do stuff with the response here if needed
        console.log('updatedProduct', updatedProduct);
      }
    });
  }

  if(!product) return <Skeleton />;
  return (
    <li className='list-none p-2 block'>
      <Link to={`/products/${product?._id}`}>{product?.title}</Link>
      <p>{product?.description}</p>
      <button className='btn-xs btn-second' onClick={handleToggleFavorite}>{product?.userFavorite ? 'Unfavorite' : 'Favorite'}</button>
    </li>
  )
}

// custom loading skeleton for this component, by defining it right here we can keep it synced with any changes we make to the actual component above
const Skeleton = () => {
  return (
    <li className="animate-pulse list-none p-2 block cursor-default select-none">
      <p className='bg-gray-600 text-gray-600 w-fit'>My Product Title</p>
      <p className='bg-gray-400 text-gray-400 w-fit'>This is my sample product description</p>
    </li>
  )
}
// add the skeleton to the component so we can access it in other components (ProductList in this case)
MyProductListItem.Skeleton = Skeleton;

MyProductListItem.propTypes = {
  id: PropTypes.string.isRequired
}

export default MyProductListItem;