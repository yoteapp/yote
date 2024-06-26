import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import apiUtils from '../../global/utils/api';

import {
  handleCreateFulfilled
  , handleFetchSinglePending
  , handleFetchSingleFulfilled
  , handleFetchSingleRejected
  , handleFetchListPending
  , handleFetchListFulfilled
  , handleFetchListRejected
  , handleMutationPending
  , handleMutationFulfilled
  , handleMutationRejected
  , handleDeletePending
  , handleDeleteFulfilled
  , handleDeleteRejected
  , shouldFetch
  , INITIAL_STATE
  , handleInvalidateQuery
  , handleAddSingleToList
  , selectListItems
  , selectSingleById
  , handleInvalidateQueries
} from '../../global/utils/storeUtils';


// First define all API calls for product
/**
 * The functions below, called thunks, allow us to perform async logic. They
 * can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
 * will call the thunk with the `dispatch` function as the first argument. Async
 * code can then be executed and other actions can be dispatched. Thunks are
 * typically used to make async requests.
 * 
 * In practice we won't dispatch these directly, they will be dispatched by productService which has a nicer api built on hooks.
 */

// CREATE
export const sendCreateProduct = createAsyncThunk(
  'product/sendCreate'
  , async (newProduct) => {
    const endpoint = `/api/products`;
    const response = await apiUtils.callAPI(endpoint, 'POST', newProduct);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// READ
export const fetchSingleProduct = createAsyncThunk(
  'product/fetchSingle'
  , async (id) => {
    const endpoint = `/api/products/${id}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);
export const fetchProductList = createAsyncThunk(
  'product/fetchList' // this is the action name that will show up in the console logger.
  , async (listArgs) => {
    const endpoint = `/api/products?${listArgs}`;
    const response = await apiUtils.callAPI(endpoint);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// UPDATE
export const sendUpdateProduct = createAsyncThunk(
  'product/sendUpdate'
  , async ({ _id, ...updates }) => {
    const endpoint = `/api/products/${_id}`;
    const response = await apiUtils.callAPI(endpoint, 'PUT', updates);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// DELETE
export const sendDeleteProduct = createAsyncThunk(
  'product/sendDelete'
  , async (id) => {
    const endpoint = `/api/products/${id}`;
    const response = await apiUtils.callAPI(endpoint, 'DELETE');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

// next define the store's initial state, all of our store utils rely on a specific state shape, so use the constant
const initialState = { ...INITIAL_STATE };

// define the productSlice. This is a combination of actions and reducers. More info: https://redux-toolkit.js.org/api/createSlice
export const productSlice = createSlice({
  name: 'product'
  , initialState
  /**
   * The `reducers` field lets us define reducers and generate associated actions.
   * Unlike the selectors defined at the bottom of this file, reducers only have access
   * to this specific reducer and not the entire store.
   * 
   * Again, we will not dispatch these directly, they will be dispatched by productService.
   */
  , reducers: {
    invalidateQuery: handleInvalidateQuery
    , invalidateQueries: handleInvalidateQueries
    , addProductToList: handleAddSingleToList
  }

  /**
   * The `extraReducers` field lets the slice handle actions defined elsewhere,
   * including actions generated by createAsyncThunk or in other slices.
   * We'll use them to track our server request status.
   * 
   * We'll add a case for each API call defined at the top of the file to dictate
   * what happens during each API call lifecycle.
   */
  , extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(sendCreateProduct.fulfilled, handleCreateFulfilled)

      // READ
      .addCase(fetchSingleProduct.pending, handleFetchSinglePending)
      .addCase(fetchSingleProduct.fulfilled, handleFetchSingleFulfilled)
      .addCase(fetchSingleProduct.rejected, handleFetchSingleRejected)
      .addCase(fetchProductList.pending, handleFetchListPending)
      // because lists are returned from the server named for their resource, we need to pass a `listKey` so the util can properly handle the response
      .addCase(fetchProductList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'products'))
      .addCase(fetchProductList.rejected, handleFetchListRejected)

      // UPDATE
      .addCase(sendUpdateProduct.pending, handleMutationPending)
      .addCase(sendUpdateProduct.fulfilled, handleMutationFulfilled)
      .addCase(sendUpdateProduct.rejected, handleMutationRejected)
      // .addCase(sendUpdateProduct.fulfilled, (state, action) => handleMutationFulfilled(state, action, (newState, action) => {
      //   // by passing this optional callback we now have access to the new state if we want to do something else with it, this works for all reducer handlers
      // }))

      // DELETE
      .addCase(sendDeleteProduct.pending, handleDeletePending)
      .addCase(sendDeleteProduct.fulfilled, handleDeleteFulfilled)
      .addCase(sendDeleteProduct.rejected, handleDeleteRejected)
  }
});

// export the actions for the reducers defined above
export const { invalidateQuery, invalidateQueries, addProductToList } = productSlice.actions;


// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

// this will fetch from server or return existing data from the store.
// it will always return a promise so we can call `.then()` on it.
export const fetchListIfNeeded = (queryKey) => (dispatch, getState) => {
  const productQuery = getState().product.listQueries[queryKey];
  if(shouldFetch(productQuery)) {
    // console.log('Fetching product list', queryKey);
    return dispatch(fetchProductList(queryKey));
  } else {
    return dispatch(() => {
      // console.log('No need to fetch, fresh query in cache');
      const productStore = getState().product;
      const query = productStore.listQueries[queryKey];
      return Promise.resolve({
        payload: {
          products: selectListItems(productStore, queryKey)
          , ...query
        }
      })
    })
  }
};

// this will fetch from server or return existing data from the store.
// it will always return a promise so we can call `.then()` on it.
export const fetchSingleIfNeeded = (id) => (dispatch, getState) => {
  const productQuery = getState().product.singleQueries[id];
  if(shouldFetch(productQuery)) {
    return dispatch(fetchSingleProduct(id));
  } else {
    // console.log('No need to fetch, fresh query in cache');
    return dispatch(() => {
      // console.log('No need to fetch, fresh query in cache');
      const productStore = getState().product;
      return Promise.resolve({
        payload: {
          product: selectSingleById(productStore, id)
        }
      })
    })
  }
}

export default productSlice.reducer;
