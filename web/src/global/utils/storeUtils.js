/**
 *  a set of utils shared by all resource reducers (called slices) and services
 */

/**
 * Helper method to determine whether to make the fetch from the server or not.
 * @param {object} query - the query object from the reducer query map
 * @returns {boolean} true || false
 */
export const shouldFetch = (query) => {
  /**
   * 
   * NOTE: Uncomment console logs to help debugging
   */

  // console.log("Query in question: ", query);
  if(!query) {
    // yes, the query we're looking for wasn't found
    // console.log("X shouldFetch - true: query not found");
    return true;
  } else if(query.status === 'pending') {
    // no, this query is already in progress
    // console.log("X shouldFetch - false: fetching");
    return false
  } else if(query.status === 'rejected') {
    // no, this query had an error, re-fetching could cause an infinite loop.
    // console.log("X shouldFetch - false: isError");
    return false
  } else if(new Date().getTime() > query.expirationDate) {
    // yes, the query has expired
    // console.log("X shouldFetch - true: query has expired");
    return true;
  } else {
    // maybe, depends on if the query was invalidated
    // console.log("X shouldFetch - " + query.didInvalidate + ": didInvalidate");
    return query.didInvalidate;
  }
}

/**
 * Theoretically we could map the objects by any key, not just the _id.
 * @param {[object]} items - An array of objects
 * @param {string} key - The key used to create the map ("_id" by default)
 * @returns a map of items by key
 * @example
 * items: [{_id: 1, name: "first"}, {_id: 2, name: "second"}, etc...]
 * returns: {1: {_id: 1, name: "first"}, 2: {_id: 2, name: "second"}, etc...}
 */
export const convertListToMap = (items = [], key = '_id') => {
  return items.reduce((acc, curr) => {
    acc[curr[key]] = curr
    return acc
  }, {})
}

// the initial state for all resource stores
export const INITIAL_STATE = {
  /**
   * "byId" is an object map of all resource items in the store. The map's keys are
   * the Mongo ids of the objects by default. This is where all resource objects will live.
   */
  byId: {}

  /**
   * "queries" is an object map of all server fetches for resources. The map's keys are listArgs
   * in the case of list fetches and Mongo ids in the case of single fetches.
   * Each individual query looks like this:
   * 
   * @example {
   *  expirationDate: date
   *  receivedAt: date
   *  status: 'pending' || 'fulfilled' || 'rejected'
   *  // for lists
   *  ids: [mongoId, mongoId]
   *  // for singles
   *  id: mongoId
   * }
   */
  , singleQueries: {}
  , listQueries: {}
};

// reducer handlers, reused across all resource reducers. They manipulate the state object defined above.
export const handleInvalidateQuery = (state, action, cb) => {
  const queryKey = action?.payload || {};
  const query = state.listQueries[queryKey] || state.singleQueries[queryKey];
  if(query) {
    query.didInvalidate = true;
    query.error = null; // clear errors on invalidate or we'll never refetch
    query.status = 'idle';
  }
  cb && cb(state, action)
}

export const handleInvalidateQueries = (state, action, cb) => {
  const queryKeys = action?.payload || [];
  const queries = queryKeys?.map(key => state.listQueries[key] || state.singleQueries[key])
  queries?.forEach(query => {
    query.didInvalidate = true;
    query.error = null; // clear errors on invalidate or we'll never refetch
    query.status = 'idle';
  })
  cb && cb(state, action)
}

export const handleAddSingleToList = (state, action, cb) => {
  const { queryKey, id } = action?.payload || {};
  const query = state.listQueries[queryKey];
  if(query && id) {
    // add to the list of ids and remove duplicates
    query.ids = [...new Set([...query.ids, id])];
  } else {
    console.log('Could not find list');
  }
  cb && cb(state, action)
}

export const handleAddManyToList = (state, action, cb) => {
  const { queryKey, ids } = action?.payload || {};
  const query = state.listQueries[queryKey];
  if(query && ids) {
    // add to the list of ids and remove duplicates
    query.ids = query.ids ? [...new Set([...query.ids, ...ids])] : ids;
  } else {
    // console.log('Could not find list');
  }
  cb && cb(state, action)
}

export const handleRemoveManyFromList = (state, action, cb) => {
  const { queryKey, ids } = action?.payload || {};
  if(!ids) {
    console.error('handleRemoveManyFromList: no ids passed in');
    cb && cb(state, action);
    return;
  }
  const query = state.listQueries[queryKey];
  if(query && ids) {
    // remove the ids from the list
    query.ids = query.ids.filter(id => !ids.includes(id));
  } else {
    // console.log('Could not find list');
  }
  cb && cb(state, action)
}

export const handleUpdateManyInMap = (state, action, cb) => {
  const items = action?.payload || {};
  // convert the array of objects to a map
  const resourceMap = convertListToMap(items, '_id');
  // add the resource objects to the byId map
  state.byId = { ...state.byId, ...resourceMap };
  cb && cb(state, action)
}

export const handleCreateFulfilled = (state, action, cb) => {
  // console.log('action', action);
  const resource = action?.payload || {};
  // by default we'll invalidate all lists when a new resource is created, but we can pass in preserveLists: true to the action to prevent this
  const { preserveLists } = action?.meta?.arg || {};
  // add it to the map
  state.byId[resource._id] = resource;
  // create a query object for it
  state.singleQueries[resource._id] = {
    id: resource._id
    , status: 'fulfilled'
    , receivedAt: Date.now()
    , expirationDate: utilNewExpirationDate()
  }
  if(!preserveLists) {
    // A new resource was just created. Rather than dealing with adding it to a list or invalidating specific lists from the component we'll just invalidate the listQueries here.
    Object.keys(state.listQueries)?.forEach(queryKey => {
      state.listQueries[queryKey].didInvalidate = true;
    });
  }
  cb && cb(state, action);
}

export const handleFetchSinglePending = (state, action, cb) => {
  // update or create a query object for it in the queries map
  const singleQuery = state.singleQueries[action.meta.arg] || {};
  // preserve the existing id if it's already there, otherwise use the query arg as the id
  state.singleQueries[action.meta.arg] = { ...singleQuery, id: singleQuery.id || action.meta.arg, status: 'pending', didInvalidate: false, error: null };
  cb && cb(state, action);
}

export const handleFetchSingleFulfilled = (state, action, cb) => {
  const resource = action?.payload || {};
  // add the resource object to the byId map
  state.byId[resource._id || action.meta.arg] = resource;
  // find the query object for this fetch in the singleQueries map and update query info
  const singleQuery = state.singleQueries[action.meta.arg];
  singleQuery.id = resource._id || action.meta.arg; // in case `action.meta.arg` was a query string
  singleQuery.status = 'fulfilled';
  singleQuery.receivedAt = Date.now();
  singleQuery.expirationDate = utilNewExpirationDate();
  cb && cb(state, action);
}
// this is the same as handleFetchSingleFulfilled but it's used for the case where we fetch a single resource from a list
export const handleFetchSingleFromListFulfilled = (state, action, listKey, cb) => {
  const { [listKey]: resourceList, totalCount, totalPages, ...otherData } = action?.payload || {};
  if(resourceList?.length > 1) console.error(`More than one resource returned from list fetch. This should not happen. (handleFetchSingleFromListFulfilled for ${listKey} with args ${action.meta.arg})`);
  const resource = resourceList?.[0];
  // add the resource object to the byId map
  if(resource) {
    state.byId[resource._id || action.meta.arg] = resource;
  }
  // find the query object for this fetch in the singleQueries map and update query info
  const singleQuery = state.singleQueries[action.meta.arg];
  singleQuery.id = resource?._id || action.meta.arg; // in case `action.meta.arg` was a query string
  singleQuery.status = 'fulfilled';
  singleQuery.receivedAt = Date.now();
  singleQuery.expirationDate = utilNewExpirationDate();
  singleQuery.otherData = otherData || {};
  cb && cb(state, action);
}

export const handleFetchSingleRejected = (state, action, cb) => {
  // find the query object for this fetch in the singleQueries map and update query info
  const singleQuery = state.singleQueries[action.meta.arg];
  singleQuery.status = 'rejected';
  singleQuery.error = action.error.message;
  singleQuery.receivedAt = Date.now();
  cb && cb(state, action);
}

export const handleFetchListPending = (state, action, cb) => {
  // update or create the query object for it in the listQueries map
  state.listQueries[action.meta.arg] = state.listQueries[action.meta.arg] || {};
  state.listQueries[action.meta.arg] = { ...state.listQueries[action.meta.arg], status: 'pending', didInvalidate: false, error: null };
  cb && cb(state, action);
}

export const handleFetchListFulfilled = (state, action, listKey, cb) => {
  const { [listKey]: resourceList, totalPages, totalCount, ...otherData } = action?.payload || {};
  // update list query
  // convert the array of objects to a map
  const resourceMap = convertListToMap(resourceList, '_id');
  // add the resource objects to the byId map
  state.byId = { ...state.byId, ...resourceMap };
  // find the query object for this fetch in the listQueries map and update query info
  const listQuery = state.listQueries[action.meta.arg];
  // save the array of ids for the returned resourceList
  listQuery.ids = resourceList?.map(resource => resource._id);
  // set the rest of the query info
  listQuery.totalPages = totalPages;
  listQuery.totalCount = totalCount;
  listQuery.status = 'fulfilled';
  listQuery.receivedAt = Date.now();
  listQuery.expirationDate = utilNewExpirationDate();
  listQuery.otherData = otherData || {};

  // while we're here we might as well add a single query for each of these since we know they're fresh
  resourceList?.forEach(resource => {
    // udpate or create the query object for it in the singleQueries map
    state.singleQueries[resource._id] = state.singleQueries[resource._id] || {};
    state.singleQueries[resource._id] = {
      ...state.singleQueries?.[resource._id]
      , id: resource._id
      , status: 'fulfilled'
      , receivedAt: listQuery.receivedAt
      , expirationDate: listQuery.expirationDate
      , didInvalidate: false
      , error: null
    };
  });
  cb && cb(state, action);
}

export const handleFetchListRejected = (state, action, cb) => {
  const listQuery = state.listQueries[action.meta.arg];
  listQuery.status = 'rejected';
  listQuery.error = action.error.message;
  listQuery.receivedAt = Date.now();
  listQuery.totalPages = 0;
  listQuery.totalCount = 0;
  cb && cb(state, action);
}

export const handleMutationPending = (state, action, cb) => {
  // action.meta.arg in this case is the updated resource object that was sent in the PUT plus the endpoint and queryKey if they were passed in
  const { endpoint, queryKey, ...updatedResource } = action.meta.arg
  // get the resource id
  const id = updatedResource._id;
  // access the query object in the map using the queryKey, fallback to the id if no queryKey was passed in
  const singleQueryKey = queryKey || id;
  // access or create the query object in the map
  state.singleQueries[singleQueryKey] = state.singleQueries[singleQueryKey] || {};
  state.singleQueries[singleQueryKey] = { ...state.singleQueries[singleQueryKey], id: id, status: 'pending', error: null, failedMutation: null }
  // save a copy of the original resource on the query object in case we need to revert (or to show the user the original version)
  state.singleQueries[singleQueryKey].previousVersion = { ...state.byId[id] };
  // optimistic update the version that's in the map because it's the one that will be used by the component
  state.byId[id] = { ...state.byId[id], ...updatedResource }
  cb && cb(state, action);
}

export const handleMutationFulfilled = (state, action, cb) => {
  const resource = action?.payload || {};
  const { queryKey } = action.meta.arg;
  const id = resource._id;
  const singleQueryKey = queryKey || id;
  // replace the previous version in the map with the new one from the server
  state.byId[resource._id] = resource;
  // update the query object
  state.singleQueries[singleQueryKey] = state.singleQueries[singleQueryKey] || {};
  const singleQuery = state.singleQueries[singleQueryKey]
  singleQuery.status = 'fulfilled';
  singleQuery.receivedAt = Date.now();
  singleQuery.expirationDate = utilNewExpirationDate();
  // by default we'll invalidate all lists when a resource is updated, but we can pass in preserveLists: true to the action to prevent this
  const { preserveLists } = action?.meta?.arg || {};
  if(!preserveLists) {
    Object.keys(state.listQueries)?.forEach(queryKey => {
      state.listQueries[queryKey].didInvalidate = true;
    });
  }
  cb && cb(state, action);
}

export const handleMutationRejected = (state, action, cb) => {
  // action.meta.arg in this case is the updated resource object that was sent in the PUT plus the endpoint and queryKey if they were passed in
  const { endpoint, queryKey, ...resource } = action.meta.arg
  const id = resource._id;
  const singleQueryKey = queryKey || id;
  // update the query object
  const singleQuery = state.singleQueries[singleQueryKey];
  // set the failed version on the query object in case we need it to show the user the failed version or to reapply their changes
  singleQuery.failedMutation = resource;
  // revert the version that's in the map to the previous version
  state.byId[id] = { ...singleQuery.previousVersion };
  // remove the previous version from the query object since we didn't update the server
  delete singleQuery.previousVersion;
  singleQuery.status = 'rejected';
  singleQuery.error = action.error.message;
  singleQuery.receivedAt = Date.now();
  cb && cb(state, action);
}

export const handleMutateManyPending = (state, action, cb) => {
  // action.meta.arg in this case is the array of resource object ids that were sent in the POST
  const resourceIds = action.meta.arg.ids
  resourceIds?.forEach(id => {
    // access or create the query object in the map
    state.singleQueries[id] = { ...state.singleQueries[id], id: id, status: 'pending', error: null }
  });
  cb && cb(state, action);
}

export const handleMutateManyFulfilled = (state, action, listKey, cb) => {
  const { [listKey]: resourceList } = action?.payload || {};
  if(resourceList && resourceList.length) {
    resourceList?.forEach(resource => {
      // replace the previous version in the map with the new one from the server
      state.byId[resource._id] = resource;
      // add or update the query object
      state.singleQueries[resource._id] = state.singleQueries[resource._id] || {};
      state.singleQueries[resource._id] = {
        ...state.singleQueries[resource._id]
        , id: resource._id
        , status: 'fulfilled'
        , receivedAt: Date.now()
        , expirationDate: utilNewExpirationDate()
      }
    });
    // resources were just updated. Rather than dealing with adding them a list or invalidating specific lists from the component we'll just invalidate the listQueries here.
    Object.keys(state.listQueries)?.forEach(queryKey => {
      state.listQueries[queryKey].didInvalidate = true;
    });
  } else {
    // still need to set the status to fulfilled
    const resourceIds = action.meta.arg.ids
    resourceIds?.forEach(id => {
      // update the query object
      const singleQuery = state.singleQueries[id];
      singleQuery.status = 'fulfilled';
    });
  }
  cb && cb(state, action);
}

export const handleMutateManyRejected = (state, action, cb) => {
  // action.meta.arg in this case is the array of resource object ids that were sent in the POST
  const resourceIds = action.meta.arg.ids
  resourceIds?.forEach(id => {
    // reset the query object, we don't really want to invalidate the resources since they weren't updated
    const singleQuery = state.singleQueries[id];
    singleQuery.status = 'fulfilled';
  });
  cb && cb(state, action);
}

export const handleDeletePending = (state, action, cb) => {
  // action.meta.arg in this case is the resource id that was sent in the DELETE
  const resourceId = action.meta.arg;
  // access or create the query object in the map
  state.singleQueries[resourceId] = state.singleQueries[resourceId] || {};
  state.singleQueries[resourceId] = { ...state.singleQueries[resourceId], id: resourceId, status: 'pending', error: null }
  cb && cb(state, action);
}

export const handleDeleteFulfilled = (state, action, cb) => {
  const resourceId = action.meta.arg;
  Object.keys(state.listQueries)?.forEach(queryKey => {
    // filter the resource from the existing lists before we remove it from the store below (avoid reference errors)
    state.listQueries[queryKey].ids = state.listQueries[queryKey].ids?.filter(id => id !== resourceId);
    // invalidate existing lists
    state.listQueries[queryKey].didInvalidate = true;
  });
  // remove the query object
  delete state.singleQueries[resourceId];
  // remove it from the map
  delete state.byId[resourceId];
  cb && cb(state, action);
}

export const handleDeleteRejected = (state, action, cb) => {
  const resourceId = action.meta.arg;
  // update the query object
  const singleQuery = state.singleQueries[resourceId];
  singleQuery.status = 'rejected';
  singleQuery.error = action.error.message;
  singleQuery.receivedAt = Date.now();
  cb && cb(state, action);
}

/**
 * 
 * @param {Function} dispatch - the dispatch function from the useDispatch hook
 * @param {Object} store - the resource specific store (e.g. productStore)
 * @param {Function} listFetch - the fetch action creator defined in the resource store (e.g. fetchProductList)
 * @param {string} queryKey - the key used to access the query from the store
 * @param {string} listKey - the name of the list returned from the server (e.g. `products`)
 * @returns the thenable dispatch function or a resolved promise that returns the current list in the same format as the fetch response
 */
export const handleFetchListIfNeeded = (dispatch, store, listFetch, queryKey, listKey) => {
  // validate arguments
  if(!dispatch || !store || !listFetch || !queryKey || !listKey) {
    console.error('handleFetchListIfNeeded: missing arguments');
    return;
  }
  const query = store.listQueries[queryKey];
  if(shouldFetch(query)) {
    // console.log(`Fetching ${listKey} list, queryKey);
    return dispatch(listFetch(queryKey));
  } else {
    // console.log('No need to fetch, fresh query in cache');
    // return a resolved promise so we can still chain off this function if we want, just as we return the dispatch above so we can chain off that.
    // first get the current list
    const currentList = selectListItems(store, queryKey);
    return Promise.resolve({
      payload: {
        [listKey]: currentList
        , totalPages: query.totalPages
        , currentPage: query.currentPage
      }
      , error: null
    })
  }
}

/**
 * 
 * @param {Function} dispatch - the dispatch function from the useDispatch hook
 * @param {Object} store - the resource specific store (e.g. productStore)
 * @param {Function} singleFetch - the fetch action creator defined in the resource store (e.g. fetchSingleProduct)
 * @param {string} queryKey - the key used to access the query from the store
 * @returns the thenable dispatch function or a resolved promise that returns the current single in the same format as the fetch response
 */
export const handleFetchSingleIfNeeded = (dispatch, store, singleFetch, queryKey) => {
  // validate arguments
  if(!dispatch || !store || !singleFetch || !queryKey) {
    console.error('handleFetchSingleIfNeeded: missing arguments');
    return;
  }
  const query = store.singleQueries[queryKey];
  if(shouldFetch(query)) {
    // console.log(`Fetching single, queryKey);
    return dispatch(singleFetch(queryKey));
  } else {
    // console.log('No need to fetch, fresh query in cache');
    // return a resolved promise so we can still chain off this function if we want, just as we return the dispatch above so we can chain off that.
    // first get the current single
    const currentSingle = selectSingleByQueryKey(store, queryKey);
    return Promise.resolve({
      payload: currentSingle
      , error: null
    })
  }
}


/**
 * The functions below are called a selectors and allow us to select a value from
 * the store.
 * 
 * These are the replacement for the old mapStoreToProps functionality.
 * 
 * Selectors can also be defined inline where they're used, for example: `const product = useSelector((store) => store.product.byId[id])`
 * 
 * Because selectors take the whole store as their first argument, and our
 * stores are all structured the same way, we define these at the global
 * level and pass in the store we want to access when we use them.
 * 
 * for example in productService:
 * 
 * const singleProduct = useSelector(store => selectSingleById(store.product, productId))
 * 
 */

/**
 * 
 * @param {object} resourceStore - supplied by useSelector hook in the service file
 * @param {string} queryKey - the key used to access the query from the map
 * @returns an array of resource objects matching the query's `ids` array or null if it hasn't been fetched yet
 */
export const selectListItems = (resourceStore, queryKey) => {
  const listIds = resourceStore.listQueries[queryKey]?.ids;
  if(listIds) {
    return listIds.map(id => resourceStore.byId[id]);
  } else {
    return null;
  }
}

/**
 * 
 * @param {object} resourceStore - supplied by useSelector hook in the service file
 * @param {string} id - the key used to access the query from the map (resource mongo id)
 * @returns the single resource from the store or null if it hasn't been fetched yet
 */
export const selectSingleById = (resourceStore, id) => {
  return resourceStore.byId[id];
}
// like selectSingleById but uses the queryKey instead of the id for single fetches with a query
export const selectSingleByQueryKey = (resourceStore, queryKey) => {
  const query = selectQuery(resourceStore, queryKey);
  if(query) {
    return selectSingleById(resourceStore, query.id);
  } else {
    return null;
  }
}

/**
 * 
 * @param {object} resourceStore - supplied by useSelector hook in the service file
 * @param {string} queryKey - the key used to access the query from the map
 * @returns {{
 *    status: 'pending' | 'fulfilled' | 'rejected',
 *    ids: Array<string> | null, // for lists only
 *    id: string | null, // for singles only
 *    expirationDate: number | null, // for 'fulfilled' status only
 *    receivedAt: number | null,
 *    didInvalidate: boolean,
 *    error: string | null, // for 'rejected' status only
 *    otherData: object | null
 * }} the query object from the store
 */
export const selectQuery = (resourceStore, queryKey) => {
  const query = resourceStore.listQueries[queryKey] || resourceStore.singleQueries[queryKey];
  return query || {};
}

// UTILS

export const utilNewExpirationDate = () => {
  return Date.now() + (1000 * 60 * 5); // 5 minutes from now
}

/**
 * Parse listArgs and endpoint from the arguments passed into the query hook
 * 
 * @param {[string | object | null]} args - accepts two optional arguments: a string (endpoint) or an object (listArgs) or both as (endpoint, listArgs)
 * @returns {{endpoint: string | null, listArgs: object}}
 */
export const parseQueryArgs = (args) => {
  // set up defaults
  let endpoint; // this will remain undefined if no endpoint is passed in, null is reserved to hold up the fetch until an endpoint is ready to be passed in (see productStore for notes)
  let listArgs = {}; // default to empty object which will fetch all from the given endpoint
  // loop through the args to determine what was passed in
  args?.forEach(arg => {
    if(arg === null) { // null means we want to wait for an endpoint to be passed in
      endpoint = null;
    } else if(typeof arg === 'string') {
      // string means endpoint
      endpoint = arg;
    } else if(typeof arg === 'object') {
      // object means listArgs
      listArgs = arg;
    } else if(!!arg) {
      console.error(`parseQueryArgs: invalid argument passed in, must be a string or an object, received ${typeof arg}: ${arg}`);
    }
  });
  return { endpoint, listArgs };
}

/**
 * Build an endpoint string from a template and an object of arguments
 * @param {String} endpointTemplate - a string with optional placeholders for arguments (e.g. 'products/:id')
 * @returns {endpointBuilder} a function that accepts an optional object of arguments matching the placeholders in the template and returns a string with the placeholders replaced with the argument values (e.g. ({id: 123}) => 'products/123')
 */
export const createEndpoint = (endpointTemplate) => {
  /**
   * Function to replace placeholders in the endpoint template with values from the provided arguments
   * @param {Object} args - an object of arguments matching the placeholders in the template
   * @returns {String|null} a string with the placeholders replaced with the argument values, or null if there are any remaining placeholders
   */
  function endpointBuilder(args = {}) {
    let endpoint = endpointTemplate;

    // Replace each placeholder in the template with the corresponding value from the args object
    for (const [key, value] of Object.entries(args)) {
      if(value === undefined || value === null) {
        return null;
      }
      endpoint = endpoint.replace(`:${key}`, value?.toString());
    }

    // If there are any remaining placeholders in the endpoint, return null to hold off on the fetch until the endpoint is ready
    if(/:[a-zA-Z0-9_]+/.test(endpoint)) {
      console.error(`Endpoint template "${endpointTemplate}" has unresolved placeholders. Remaining placeholders: ${endpoint.match(/:[a-zA-Z0-9_]+/g).join(', ')}`);
      return null;
    }
    return endpoint;
  };
  return endpointBuilder;
}