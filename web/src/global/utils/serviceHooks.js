/**
 * This global set of hooks contains most of the logic that is shared across each resource service.
 * It's designed to be called by each separate resource service with args specific to that resource.
 */


import { useEffect, useState, SyntheticEvent, useMemo, useCallback } from 'react';
import { useIsFocused } from '../../global/utils/customHooks';
import _ from 'lodash';

import apiUtils from '../../global/utils/api';

import {
  selectListItems
  , selectSingleById
  , selectSingleByQueryKey
  , selectQuery
} from '../../global/utils/storeUtils';

/**
 * This hook will perform the provided fetch action and return the fetch status and resource from the store.
 * 
 * @param {string} id - the id of the resource to be fetched
 * @param {object} fromStore - the resource specific store that we're getting the resource from (e.g. store.products, store.users, etc)
 * @param {function} sendFetchById - the dispatched action to fetch the resource (e.g. (id) => dispatch(fetchProductById(id)))
 * @param {function} sendInvalidateSingle - the dispatched action to invalidate the resource (e.g. (id) => dispatch(invalidateQuery(id)))
 * @returns an object containing fetch info and eventually the resource as `data` (see ServiceHookResponse)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetResourceById = ({
  id
  , fromStore
  , sendFetchById
  , sendInvalidateSingle
}) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if(id && isFocused) sendFetchById(id);
    // this is the dependency array. useEffect will run anytime one of these changes
  }, [id, sendFetchById, isFocused]);

  const invalidate = () => {
    sendInvalidateSingle(id);
  }

  const refetch = () => {
    sendInvalidateSingle(id);
    sendFetchById(id);
  }

  // get the query status from the store
  const { status, error, previousVersion, failedMutation, receivedAt } = selectQuery(fromStore, id);
  // get current resource from the store (if it exists)
  const resource = selectSingleById(fromStore, id);

  const isFetching = status === 'pending' || status === undefined;
  const isLoading = isFetching && !resource;
  const isError = status === 'rejected';
  const isSuccess = status === 'fulfilled';
  const isEmpty = isSuccess && !resource;

  // return the info for the caller of the hook to use
  return {
    data: resource
    , error
    , isFetching
    , isLoading
    , isError
    , isSuccess
    , isEmpty
    , invalidate
    , previousVersion
    , failedMutation
    , refetch
    , receivedAt
  }
}
/**
 * This hook will perform the provided fetch action and return the fetch status and resource from the store.
 * It's designed to return a single resource from the list endpoints using a query.
 * 
 * @param {object} listArgs - an object containing the query args to be used for the fetch (e.g. { _user: userId, featured: true })
 * @param {object} fromStore - the resource specific store that we're getting the resource from (e.g. store.products, store.users, etc)
 * @param {function} sendFetchBySingle - the dispatched action to fetch the resource (e.g. (id) => dispatch(fetchSingleWithPermission(queryString)))
 * @param {function} sendInvalidateSingle - the dispatched action to invalidate the resource (e.g. (id) => dispatch(invalidateQuery(queryString)))
 * @param {string?} endpoint - the endpoint to be used for the query (e.g. `logged-in`)
 * @returns an object containing fetch info and eventually the resource as `data` (see ServiceHookResponse)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetResource = ({
  listArgs
  , fromStore
  , sendFetchSingle
  , sendInvalidateSingle
  , endpoint
}) => {
  if(!listArgs) throw new Error('useGetResource requires listArgs');
  // if endpoint is null then we are not yet ready to fetch
  const readyToFetch = endpoint !== null && apiUtils.checkListArgsReady(listArgs);

  const isFocused = useIsFocused();

  // convert the query object to a query string for the new server api
  // also makes it easy to track the lists in the reducer by query string
  let queryString = apiUtils.queryStringFromObject(listArgs);

  // add the endpoint to the front of the query string if it exists ex: `logged-in?isActive=true`, otherwise just `?isActive=true`
  queryString = endpoint ? `/${endpoint}?${queryString || ''}` : `?${queryString || ''}`;

  useEffect(() => {
    if(readyToFetch && isFocused) {
      sendFetchSingle(queryString);
    } else {
      // listArgs aren't ready yet, don't attempt fetch
      // console.log("still waiting for listArgs");
    }
  }, [readyToFetch, sendFetchSingle, queryString, isFocused]);

  // get the query info from the store
  const { status, error, otherData, previousVersion, receivedAt } = selectQuery(fromStore, queryString);

  // get current resource from the store (if it exists)
  const resource = selectSingleByQueryKey(fromStore, queryString);

  const isFetching = status === 'pending' || status === undefined;
  const isLoading = isFetching && !resource;
  const isError = status === 'rejected';
  const isSuccess = status === 'fulfilled';
  const isEmpty = isSuccess && !resource;

  const invalidate = () => {
    sendInvalidateSingle(queryString);
  }

  const refetch = () => {
    sendInvalidateSingle(queryString);
    sendFetchSingle(queryString);
  }

  // return the info for the caller of the hook to use
  return {
    data: resource
    , previousVersion
    , otherData
    , error
    , isFetching
    , isLoading
    , isError
    , isSuccess
    , isEmpty
    , invalidate
    , refetch
    , receivedAt
  }
}

/**
 * This hook will perform the provided fetch action and return the fetch status and resource list from the store.
 * 
 * @param {object} listArgs - an object containing the query args to be used for the fetch (e.g. { _user: userId, featured: true })
 * @param {object} fromStore - the resource specific store that we're getting the list from (e.g. store.products, store.users, etc)
 * @param {function} sendFetchList - the dispatched action to fetch the list (e.g. (queryString) => dispatch(fetchProductList(queryString)))
 * @param {function} sendInvalidateSingle - the dispatched action to invalidate the list (e.g. (queryString) => dispatch(invalidateQuery(queryString)))
 * @returns an object containing fetch info and eventually the resource list as `data` (see ServiceHookResponse)
 * @returns an invalidate and refetch function for convenience
 */
export const useGetResourceList = ({
  listArgs
  , fromStore
  , sendFetchList
  , sendInvalidateList
  , addToList = () => { console.error('addToList not implemented') }
  , removeFromList = () => { console.error('removeFromList not implemented') }
  , endpoint
}) => {
  // isFocused is used to make sure we rerender when this screen comes into focus. This way invalidated lists will be refetched without having to interact with the page.
  const isFocused = useIsFocused();
  /**
  * NOTE: tracking lists using the query string is easy because the `listArgs` passed into
  * dispatch(fetchResourceList(listArgs)) are accessed in the store by using action.meta.arg.
  * We could try setting the queryKey to something different (or nesting it) but we'd need to figure
  * out how to access that info in the store. Maybe by passing it along as a named object like:
  * 
  * dispatch(fetchResourceList({queryString: listArgs, queryKey: someParsedVersionOfListArgs}))
  * 
  */

  // first make sure all list args are present. If any are undefined we will wait to fetch.
  // if endpoint is null then we are not yet ready to fetch
  const readyToFetch = endpoint !== null && apiUtils.checkListArgsReady(listArgs);


  // handle pagination right here as part of the fetch so we don't have to call usePagination every time from each component
  // this also allows us to pre-fetch the next page(s)
  const { page, per } = listArgs;

  const pagination = {};
  if(page && per) {
    pagination.page = page;
    pagination.per = per;
  }

  // convert the query object to a query string for the new server api
  // also makes it easy to track the lists in the reducer by query string
  let queryString = apiUtils.queryStringFromObject(listArgs);

  // add the endpoint to the front of the query string if it exists ex: `logged-in?isActive=true`
  queryString = endpoint ? `/${endpoint}?${queryString || ''}` : `?${queryString || ''}`;

  useEffect(() => {
    if(readyToFetch && isFocused) {
      sendFetchList(queryString);
    } else {
      // listArgs aren't ready yet, don't attempt fetch
      // console.log("still waiting for listArgs");
    }
  }, [readyToFetch, sendFetchList, queryString, isFocused]);

  // get the query info from the store
  const { status, error, totalPages, totalCount, ids, otherData, receivedAt } = selectQuery(fromStore, queryString);

  // get current list items (if they exist)
  const resources = useMemo(() => selectListItems(fromStore, queryString), [fromStore, queryString]);

  const isFetching = status === 'pending' || status === undefined;
  const isLoading = isFetching && !resources;
  const isError = status === 'rejected';
  const isSuccess = status === 'fulfilled';
  const isEmpty = isSuccess && resources?.length === 0;
  // add totalPages from the query to the pagination object
  pagination.totalPages = totalPages || 0;
  pagination.totalCount = totalCount || 0;

  // PREFETCH
  // if we are using pagination we can fetch the next page(s) now
  let nextQueryString = pagination.page && pagination.page < totalPages ? apiUtils.queryStringFromObject({ ...listArgs, page: Number(pagination.page) + 1, per: pagination.per }) : null;
  // add the endpoint to the front of the query string if it exists ex: `logged-in?isActive=true`
  nextQueryString = endpoint && readyToFetch ? `/${endpoint}?${nextQueryString || ''}` : nextQueryString ? `?${nextQueryString || ''}` : null;

  useEffect(() => {
    if(nextQueryString) {
      // fetch the next page now
      sendFetchList(nextQueryString);
    }
  }, [nextQueryString, sendFetchList]);

  // END PREFETCH

  const invalidate = () => sendInvalidateList(queryString);

  const refetch = () => {
    sendInvalidateList(queryString);
    sendFetchList(queryString);
  }

  const addIdsToList = (newIds) => {
    if(!newIds) return;
    if(typeof newIds === 'string') newIds = [newIds];
    addToList(queryString, newIds);
  }

  const removeIdsFromList = (removeIds) => {
    if(!removeIds) return;
    if(typeof removeIds === 'string') removeIds = [removeIds];
    removeFromList(queryString, removeIds);
  }

  // return the info for the caller of the hook to use
  return {
    ids
    , addIdsToList
    , removeIdsFromList
    , data: resources
    , otherData: otherData || {}
    , error
    , isFetching
    , isLoading
    , isError
    , isSuccess
    , isEmpty
    , invalidate
    , pagination
    , refetch
    , receivedAt
  }
}

/**
 * Use this hook to handle the creation or update of a resource.
 * 
 * @param {{
 *  resourceQuery: ServiceHookResponse 
 * , sendMutation: function
 * , initialState?: object | undefined
 * , onResponse?: function | undefined
 * }} props - an object containing the following properties:
 * @param props.resourceQuery - the object returned from the resource query hook (e.g. resourceQuery = useGetProductById(productId)) see ServiceHookResponse
 * @param  props.sendMutation - the dispatched action to send the mutation to the server (e.g. (updatedProduct) => dispatch(sendUpdateProduct(updatedProduct)))
 * @param props.initialState - the initial state we want to apply to the resource returned from the resourceQuery
 * @param  props.onResponse - a callback function that accepts the mutated resource or error
 * @returns an object containing the resource as `data` (see ServiceHookResponse) and form handlers
 */
export const useMutateResource = ({
  resourceQuery
  , sendMutation
  , initialState = {} // optional initial state that will override the data returned from the resourceQuery
  , onResponse = () => { }
  , isCreate = false
  , id
}) => {
  // STATE
  // set up a state variable to hold the resource, start with what was passed in as initialState (or an empty object)
  const [newResource, setFormState] = useState(initialState);
  // set up a state variable to hold the isWaiting flag
  const [isWaiting, setIsWaiting] = useState(false);

  // sometimes initial state can change after required data is returned from the server, so we need to update the form state
  useEffect(() => {
    if(!_.isEqual({ ...newResource, ...initialState }, newResource)) {
      setFormState(currentState => {
        return { ...currentState, ...initialState }
      });
    }
  }, [initialState])

  useEffect(() => {
    const newResourceUpdateTime = Date.parse(resourceQuery.data?.updated);
    const queryReceivedTime = resourceQuery.receivedAt
    const formStateUpdateTime = Date.parse(newResource?.updated);
    if((id === 'none' || !id) && !!newResource?._id) {
      // need to reset if we no longer have a selected resource id
      setFormState({ ...initialState })
    } else if (resourceQuery.data?._id && resourceQuery.data?._id !== newResource?._id) {
      // if the id changes, reset the form state to the newer data
      setFormState({ ...resourceQuery.data, ...initialState });
    } else if((newResourceUpdateTime > formStateUpdateTime) || (queryReceivedTime > formStateUpdateTime)) {
      // if the resource has been updated, reset the form state to the newer data
      setFormState({ ...resourceQuery.data, ...initialState });
    } else if(resourceQuery.data && !_.isEqual({ ...resourceQuery.data, ...newResource }, newResource)) {
      // once we have the fetched resource, set it to state
      // make sure we only do this if necessary to avoid an infinite loop
      // override the resource object with the currentState (which will be the initialState if any)
      setFormState(currentState => {
        return { ...resourceQuery.data, ...currentState }
      });
    }
  }, [resourceQuery.data, id])

  // FORM HANDLERS
  // setFormState will replace the entire resource object with the new resource object
  // set up a handleChange method to update nested state while preserving existing state(standard reducer pattern)
  /**
   * Standard form change handler. Updates the form state with the new value.
   * @param {SyntheticEvent} e - the form change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    // use a recursive function to set arbitrarily nested values of any depth (eg. name="key" or name="resource.key" or name="resource.nestedObject.key" etc...)
    setFormState(currentState => {
      return utilSetNestedValue(currentState, name, value);
    })
  }

  /**
   * Standard form submit handler. Dispatches the create/update action with current form state and forwards the response.
   * @param {SyntheticEvent} e - the form submit event
   */
  const handleSubmit = (e) => {
    // prevent the default form submit event if present
    e?.preventDefault && e.preventDefault();
    // set isWaiting true so the component knows we're waiting on a response
    setIsWaiting(true)
    // dispatch the create/update action
    sendMutation(newResource).then(handleResponse)
  }

  const handleResponse = useCallback((response) => {
    // We're done waiting for the response
    setIsWaiting(false);
    // we get the id from the meta.arg instead of payload because this check is only for updates and meta.arg will have the original id
    // payload will be undefined if there was an error, or it could be multiple resources depending on the action
    const responseId = response?.meta?.arg?._id;
    const hasError = !!response.error;
    // exclude the create case from this check because we won't have an id to compare to
    const selectedNewResourceDuringUpdate = !isCreate && responseId !== newResource?._id;
  
    // Exit early if it's an update and the resource ID has changed
    // this can happen when the user selects a different resource while waiting for a response
    // In this case we don't want to update the form state
    if(selectedNewResourceDuringUpdate) {
      // return the response to the callback function
      return onResponse(response.payload, response.error?.message);
    }
    if(hasError) {
      // Handle errors: reset form and log the error
      resetFormState();
      console.error("An error occurred while attempting mutation: ", response.error);
    } else {
      // Handle successful response
      if(isCreate) {
        resetFormState(); // Prepare for another create action
      } else {
        // Update the form with server-side changes
        setFormState(response.payload);
      }
    }
    // Pass the response to the callback function
    onResponse(response.payload, response.error?.message);
  }, [id]);

  /**
   * Reset the form state to the original resource
   */
  const resetFormState = () => {
    setFormState({ ...resourceQuery.data, ...initialState });
  }

  // wrap the sendMutation function to handle everything we need to do after the mutation
  // return a thenable object so we can chain additional actions after the mutation in the component
  /**
   * 
   * @param {object} data - the resource to be sent to the server
   * @returns the thenable response from the server ({ payload: resource, error: error })
   */
  const sendMutationWithComponentData = (data) => {
    const dataToSend = { ...newResource, ...data }
    setIsWaiting(true);
    return sendMutation(dataToSend).then((response) => {
      handleResponse(response);
      return response;
    })
  }


  /**
   * Undo the last mutation (for updates only). Dispatches the original update action with previous version of the resource (if one exists)
   * @param {SyntheticEvent} e - the form submit event
   */
  const handleUndoMutation = (e = null) => {
    e?.preventDefault && e.preventDefault();
    // reset the form state to the original resource
    if(resourceQuery.previousVersion) {
      setIsWaiting(true)
      sendMutation(resourceQuery.previousVersion).then(handleResponse)
    }
  }

  // let the component know if there are pending changes that need to be saved/cancelled
  /**
   * @returns {boolean} `true` if the resource has been changed from the original version and needs to be saved/cancelled
   */
  const isChanged = Boolean(newResource && resourceQuery.data && !_.isEqual(newResource, resourceQuery.data));

  // return everything the component needs to create/update the resource
  return {
    ...resourceQuery
    , data: newResource
    , handleChange
    , handleSubmit
    , handleUndoUpdate: resourceQuery.previousVersion ? handleUndoMutation : null // this will be null if there is no previous version (e.g. if we're creating a new resource instead of updating an existing one)
    , setFormState // only used if we want to handle this in a component, will usually use handleChange
    , resetFormState // only used if we want to reset the form to the original state
    , sendMutation: sendMutationWithComponentData // only used if we want to send data directly from the component, will usually use handleSubmit which pulls the data from form state
    , isChanged: isChanged
    // override isFetching if we're waiting for the mutated resource to get returned from the server (for ui purposes)
    , isFetching: isWaiting || resourceQuery.isFetching
  }
}

// UTILS
// used to set arbitrarily nested values in an object, works for any depth
const utilSetNestedValue = (obj, path, value) => {
  // split the path at the first dot so parent is the first part and child is the rest
  const [parent, ...child] = path.split('.');
  if(child?.length > 0) {
    // rejoin the child parts with a dot so we can recursively call utilSetNestedValue
    const childString = child.join('.');
    // recursively call utilSetNestedValue until we get to the last child
    return {
      ...obj
      , [parent]: utilSetNestedValue(obj[parent], childString, value)
    }
  }
  // if there is no child, we're at the last level, so just set the value
  return {
    ...obj
    , [parent]: value
  }
}


// TYPES - allows jsdoc comments to give us better intellisense
/**
 * the basic object returned from a standard service hook (e.g. StandardHookResponse = useGetProductById(productId))
 * @typedef {object} ServiceHookResponse
 * @property {object} data - the data returned from the store (an object for single fetches, an array of objects for list fetches)
 * @property {array?} ids - an array of the fetched resource ids from the `data` object (list fetches only)
 * @property {string?} error - the error message returned from the store
 * @property {boolean} isFetching - whether the service is fetching
 * @property {boolean} isError - whether the fetch returned an error
 * @property {boolean} isEmpty - whether the fetch returned no data
 * @property {boolean} isLoading - whether the fetch is loading (fetching with no current data)
 * @property {boolean} isSuccess - whether the fetch has returned successfully
 * @property {function} invalidate - a function to invalidate the resource in the store so it will refetch the next time it's accessed
 * @property {function} refetch - a function to refetch the resource from the server immediately
 * 
 */