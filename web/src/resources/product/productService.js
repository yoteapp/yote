/**
 * In YOTE, we use a pattern of having a service file for each resource.
 * 
 * Each resource added via the Yote CLI will generate a service file just like this one (aside from the custom hooks at the bottom).
 * 
 * The service file is where we define all of the
 * actions that can be performed on the resource. This includes all of the CRUD actions as well as any other actions
 * that might be specific to the resource. For example, we might have a `sendInvite` action for a user resource.
 * 
 * Product Service is an example of a resource service file.
 * 
 * This set of hooks is how we'll interact with the productStore. The idea is to provide a simple hooks-based api to get what
 * we need from the store without having to use `dispatch`, `connect`, `mapStoreToProps`, and all that stuff
 * in the components.
 */

import { useSelector, useDispatch } from 'react-redux'
import apiUtils from '../../global/utils/api';
import { createEndpoint, parseQueryArgs, selectSingleById } from '../../global/utils/storeUtils';

// import all of the actions from the store
import {
  fetchProductList
  , fetchProductListAtEndpoint
  , fetchListIfNeeded
  , fetchSingleProduct
  , fetchSingleProductAtEndpoint
  , sendCreateProduct
  , sendUpdateProduct
  , sendDeleteProduct
  , invalidateQuery
  // , invalidateQueries
  , addProductToList
  , addProductsToList
  , removeProductsFromList
  , fetchSingleIfNeeded
} from './productStore';
import {
  useGetResourceById
  , useGetResource
  , useGetResourceList
  , useMutateResource
} from '../../global/utils/serviceHooks';


// Define the hooks that we'll use to manage data in the components

// BOILERPLATE CRUD HOOKS FOR THE STANDARD PRODUCT API

// CREATE

/**
 * Use this hook to handle the creation of a new product.
 * @param {Object} initialState - The initial state of the product (optional)
 * @param {Function} onResponse - The function to call when the product is successfully created (optional)
 * @param {string} endpoint - The specific endpoint to hit when creating the product (optional)
 * @param {string} method - The http method to use when creating the product (optional, defaults to POST)
 * 
 * @returns an object containing fetch info and the following:
 * - `newProduct` as `data`: the new product object as it currently exists in state, initially the default product
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // access the create action and fetch the default product
 * const { data: newProduct, handleChange, handleSubmit, ...productQuery } = useCreateProduct({
 *   // optional, anything we want to add to the default object
 *   initialState: {
 *     someKey: 'someValue'
 *   }
 *   // optional, callback function that receives the response from the server
 *   , onResponse: (product, error) => {
 *     if(error || !product) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/products/${product._id}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={productQuery}>
 *     <ProductForm
 *       product={product}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useCreateProduct = ({ initialState = {}, onResponse = () => { }, endpoint, method }) => {
  const dispatch = useDispatch();
  // set up product specific stuff to be used by the shared hook
  const defaultProductQuery = useGetDefaultProduct();
  const sendMutation = (mutatedProduct) => dispatch(sendCreateProduct({ endpoint, method, ...mutatedProduct }));

  // the hook will return everything the caller needs to create a new product
  return useMutateResource({ resourceQuery: defaultProductQuery, sendMutation, initialState, onResponse, isCreate: true });
}

// READ

/**
 * NOTE: If you are using this because you want to create a new product, try `useCreateProduct`
 * instead. It handles everything for you!
 * 
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the defaultProduct (as `data`)
 * @returns a refetch function for convenience (will probably never be used for default product, but keeps things consistent)
 */
export const useGetDefaultProduct = (forceFetch = false) => {
  // leverage existing hooks to get the default product (using 'default' as the id will return the default product from the server)
  return useGetProductById('default', forceFetch);
}


/**
 * This hook will check for a fresh product in the store and fetch a new one if necessary
 * 
 * @param {string} id - the id of the product to be fetched
 * @param {boolean} forceFetch - optional override to force a fetch from the server
 * @returns an object containing fetch info and eventually the product (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetProductById = (id, forceFetch = false) => {
  const dispatch = useDispatch();
  // set up product specific stuff to be used by the shared hook
  const productStore = useSelector(({ product }) => product);
  const fetchProduct = forceFetch ? fetchSingleProduct : fetchSingleIfNeeded;
  const sendFetchById = (id) => dispatch(fetchProduct(id));
  const sendInvalidateSingle = (id) => dispatch(invalidateQuery(id));

  // return the (now product specific) hook
  return useGetResourceById({ id, fromStore: productStore, sendFetchById, sendInvalidateSingle });

}

/**
 * This hook will check for a fresh product in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the product (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetProduct = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up product specific stuff to be used by the shared hook
  const productStore = useSelector(({ product }) => product);
  const fetchProduct = endpoint ? fetchSingleProductAtEndpoint : fetchSingleProduct;
  const sendFetchSingle = (queryString) => dispatch(fetchSingleIfNeeded(queryString, fetchProduct));
  const sendInvalidateSingle = (queryString) => dispatch(invalidateQuery(queryString));
  // return the (now product specific) hook
  return useGetResource({ listArgs, fromStore: productStore, sendFetchSingle, sendInvalidateSingle, endpoint });
}

/**
 * This hook will check for a fresh list in the store and fetch a new one if necessary
 * 
 * @param {...string | object | null} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns an object containing fetch info and eventually the product list (as `data`)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetProductList = (...args) => {
  const dispatch = useDispatch();
  const { endpoint, listArgs } = parseQueryArgs(args);
  // set up product specific stuff to be used by the shared hook
  const productStore = useSelector(({ product }) => product);
  // if an endpoint was passed in, use that, otherwise use the default
  const fetchProducts = endpoint ? fetchProductListAtEndpoint : fetchProductList;
  const fetchProductsIfNeeded = (queryString) => fetchListIfNeeded(queryString, fetchProducts);
  const sendFetchList = (queryString) => dispatch(fetchProductsIfNeeded(queryString));
  const sendInvalidateList = (queryString) => dispatch(invalidateQuery(queryString));
  const addToList = (queryString, productIds) => dispatch(addProductsToList({ queryString, ids: productIds }));
  const removeFromList = (queryKey, productIds) => dispatch(removeProductsFromList({ queryKey, ids: productIds }));


  // return the (now product specific) hook
  return useGetResourceList({ listArgs, fromStore: productStore, sendFetchList, sendInvalidateList, endpoint, addToList, removeFromList });
}

// UPDATE

/**
 * Use this hook to access the `sendUpdateProduct` action
 * 
 * Useful if you want to update a product that you already have access to
 * 
 * NOTE: Check out `useGetUpdatableProduct` if you want to fetch and update a product
 * 
 * @returns the sendUpdateProduct action wrapped in dispatch
 * @example // to use in a component
 * // access the update action, pass in optional endpoint and method to hit a custom endpoint
 * const { sendUpdateProduct } = useUpdateProduct({ endpoint: myEndpoint, method: 'POST'});
 * // dispatch the update action
 * sendUpdateProduct(updatedProduct);
 */
export const useUpdateProduct = ({ endpoint, method }) => {
  const dispatch = useDispatch();
  const sendMutation = (mutatedProduct) => dispatch(sendUpdateProduct({ endpoint, method, ...mutatedProduct }));
  return {
    // return the update action
    sendUpdateProduct: sendMutation
  }
}

/**
 * Use this hook to handle the update of an existing product.
 * @param {string} id - the id of the product to be updated.
 * @param {Object} options - an object that expects an optional onResponse function that receives the updated product and error.
 * 
 * @returns an object containing fetch info and the following:
 * - `product` as `data`: the product object as it currently exists in state
 * - `handleChange`: standard form change handler to be used in the form
 * - `handleSubmit`: standard form submit handler to be used in the form
 * - `isChanged`: a boolean that is true if the product has pending changes that have not yet been saved via handleSubmit
 * - `setFormState`: a way to handle form state changes in the component instead of `handleChange`, rarely needed but sometimes necessary
 * @example // to use in a component
 * // fetch the product and access everything needed to handle updating it
 * const { data: product, handleChange, handleSubmit, ...productQuery } = useGetUpdatableProduct(productId, {
 *   // optional, callback function to run after the request is complete
 *   onResponse: (updatedProduct, error) => {
 *     if(error || !updatedProduct) {
 *       alert(error || "An error occurred.")
 *     }
 *     history.push(`/products/${productId}`)
 *   }
 * });
 * 
 * return (
 *   <WaitOn query={productQuery}>
 *     <ProductForm
 *       product={product}
 *       handleSubmit={handleSubmit}
 *       handleChange={handleChange}
 *     />
 *   </WaitOn>
 * )
 */
export const useGetUpdatableProduct = (id, { onResponse = () => { } } = {}) => {
  const dispatch = useDispatch();
  // set up product specific stuff to be used by the shared hook
  // use the existing hook to get the productQuery
  const productQuery = useGetProductById(id);
  const sendMutation = (mutatedProduct) => dispatch(sendUpdateProduct(mutatedProduct));
  // return the (now product specific) hook
  return useMutateResource({ resourceQuery: productQuery, sendMutation, onResponse, id });
}


// DELETE

/**
 * Use this hook to access the `sendDeleteProduct` action
 * 
 * @returns the sendDeleteProduct action wrapped in dispatch
 * 
 * @example // to use in a component
 * // access the delete action
 * const { sendDeleteProduct } = useDeleteProduct();
 * // dispatch the delete action
 * sendDeleteProduct(productId);
 */
export const useDeleteProduct = () => {
  const dispatch = useDispatch();
  return {
    // return the delete action
    sendDeleteProduct: (id) => dispatch(sendDeleteProduct(id))
  }
}

// OTHERS

/**
 * @returns the `addProductToList` action wrapped in dispatch
 */
export const useAddProductToList = () => {
  const dispatch = useDispatch();
  return {
    addProductToList: (productId, listArgs) => dispatch(addProductToList({ id: productId, queryKey: apiUtils.queryStringFromObject(listArgs) || "all" }))
  }
}

/**
 * NOTE: Only use this if you're sure the product is already in the store. WILL NOT fetch from the server.
 * @param {string} id - the id of the product that you want to grab from the store
 * @returns the product from the store's byId map
 */
export const useProductFromMap = (id) => {
  const product = useSelector(({ product: productStore }) => selectSingleById(productStore, id));
  return product
}


// CUSTOM HOOKS FOR SPECIAL ENDPOINTS ON THE PRODUCT API

// FETCH
// once plugged in to the product hook, this will create an endpoint that looks like `/api/products/logged-in`
// on the server side, this will filter the queried list of products to only those created by the logged in user.
const productsByLoggedInUserEndpoint = createEndpoint('logged-in');

/**
 * This is the simplest example of how we implement a custom fetch endpoint.
 * We define the endpoint using the `createEndpoint` helper function (see above).
 * Then we create a custom hook that sets up the fetch action with the custom endpoint.
 * We name the hook to describe the purpose of the endpoint.
 * @param {string} id - the id of the product to be fetched. 
 * @note we could add other params here if the endpoint required them
 * @returns the same thing as `useGetProduct` but set up to use a custom fetch endpoint
 */
export const useProductByLoggedIn = (id) => {
  // populate the endpoint (this one takes no params, but it could)
  const populatedEndpoint = productsByLoggedInUserEndpoint();
  // plug the endpoint and the listArgs (just the id in this case) into the standard hook and return the result to be used in the component
  return useGetProduct(populatedEndpoint, { _id: id });
}

/**
 * This is the same as useProductByLoggedIn, but for a list of products.
 * @param {object} query - the query object to be used in the fetch request 
 * @returns the same thing as `useGetProductList` but set up to use a custom fetch endpoint
 */
export const useProductListByLoggedIn = (query) => {
  // populate the endpoint (this one takes no params, but it could)
  const populatedEndpoint = productsByLoggedInUserEndpoint();
  // plug the endpoint into the standard hook and return the result to be used in the component
  return useGetProductList(populatedEndpoint, query);
}

// UPDATE BY LOGGED IN USER
// BONUS: if you search the codebase for the string `logged-in/:id` you'll quickly find the server side implementation of this endpoint because it's the same syntax as express
const updateProductByLoggedInUserEndpoint = createEndpoint('logged-in/:id');
/**
 * This is an example of how we implement a custom update endpoint, in this case for a logged in user.
 * The idea is to package up all of the logic that is specific to this endpoint in a custom hook, then expose
 * the update action with minimal code required in the component.
 * First we create the endpoint using the `createEndpoint` helper function (see above).
 * Then we create a custom hook that sets up the update action with the custom endpoint.
 * We name the hook to describe the purpose of the endpoint, and we pass in any params that are required by the endpoint.
 * @param {object} args - an object contaning the following:
 * @param {string} args.id - the id of the product to be updated. 
 * @note we could add other params here if the endpoint required them, or this could be a string instead of an object if adequate
 * @returns the dispatchable update product action with the endpoint already plugged in
 * @note this hook is meant for cases where you already have the product and just need the update action (e.g. in a list item)
 * @example // to use in a component
 * // access the update action
 * const { sendUpdateProduct } = useUpdateMyProduct({ id: productId });
 * // dispatch the update action
 * const someHandler = () => {
 *  sendUpdateProduct(updatedProduct);
 * }
 */
export const useUpdateProductByLoggedInUser = ({ id }) => {
  const updateEndpoint = updateProductByLoggedInUserEndpoint({ id });
  const { sendUpdateProduct } = useUpdateProduct({ endpoint: updateEndpoint, method: 'PUT' });
  return {
    sendUpdateProduct
  }
}

// FETCH AND UPDATE BY LOGGED IN USER
/**
 * This hook composes the `useProductByLoggedIn` and `useUpdateProductByLoggedInUser` hooks to create a single hook
 * that fetches and updates a product by a logged in user.
 * @param {object} args - an object contaning the following:
 * @param {string} args.id - the id of the product to be fetched and updated.
 * @param {Function} args.onResponse - an optional callback function that receives the updated product and error.
 * @returns the same thing as `useGetUpdatableProduct` but set up to use custom fetch and update endpoints
 */
export const useGetUpdatableProductByLoggedInUser = ({ id, onResponse = () => { } }) => {
  const productQuery = useProductByLoggedIn(id);
  const { sendUpdateProduct } = useUpdateProductByLoggedInUser({ id });
  return useMutateResource({ resourceQuery: productQuery, sendMutation: sendUpdateProduct, onResponse, id });
}

// CREATE WITH REQUIRED PARAMS
const createProductWithRequiredParamsEndpoint = createEndpoint('special/:requiredParam');

/**
 * This is an example of a custom create endpoint. In this case we require a requiredParam to be passed in.
 * This could be used to pass into middleware to check permissions, or otherwise enforce some kind of restriction.
 * @note this is a contrived example, but the pattern is useful for more complex cases
 * @param {args} args - an object containing the following:
 * @param {string} args.requiredParam - the required param for the endpoint
 * @param {object} args.initialState - the initial state of the product (optional)
 * @param {Function} args.onResponse - the function to call when the product is successfully created (optional)
 * @returns the same thing as `useCreateProduct` but set up to use a custom create endpoint
 */
export const useCreateProductWithRequiredParams = ({ requiredParam, initialState, onResponse }) => {
  const endpoint = createProductWithRequiredParamsEndpoint({ requiredParam });
  return useCreateProduct({ initialState, onResponse, endpoint, method: 'POST' });
}





