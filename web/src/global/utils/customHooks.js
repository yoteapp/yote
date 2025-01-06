/**
 * Custom hooks are stateful, reusable chunks of logic that we can use in functional components
 * Handy to cut down on repetitive boilerplate
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation, useHistory } from 'react-router-dom';

/**
 * This hook handles pagination state, for when we don't want to use url search params (e.g. for infinite scroll?)
 * @param {object} initialPagination - a pagination object, default is { page: 1, per: 10 }
 * @returns the pagination object and `setPage` and `setPer` functions
 */
export const usePagination = (initialPagination = {}) => {

  // use the built-in `useState` hook to handle state
  const [pagination, setPagination] = useState(initialPagination);

  // create specific actions to update pagination
  const setPage = newPage => {
    setPagination(state => ({ ...state, page: newPage || 1 }));
  }

  const setPer = newPer => {
    // reset the page to 1 when we change the per because the number of pages will change (and could be smaller than the current page)    
    setPagination(state => ({ page: 1, per: newPer || 10 }));
  }

  return { ...pagination, setPage, setPer };
}

/**
 * 
 * @returns {boolean} true if the window is focused, false otherwise
 */
export const useIsFocused = () => {
  const [isFocused, setIsFocused] = useState(document.visibilityState === 'visible');
  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);

  useEffect(() => {
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return isFocused;
}

/**
 * Custom hook for managing URL search parameters with default values.
 * 
 * @param {Object.<string, string|number|boolean>} [defaultValues={}] - Default key/value pairs to initialize in the URL search params if not present.
 * 
 * @returns {[queryObject: Object.<string, string>, setURLParams: (params: Object.<string, string> | string, value?: string) => void]} 
 *    - `queryObject`: An object representing the current URL search params as key/value pairs.
 *    - `setURLParams`: A function to update the search params.
 *        - Pass an object to update multiple parameters at once.
 *        - Pass a key and value pair to update a single parameter.
 * 
 * @throws {Error} If `setURLParams` is called with invalid arguments.
 */
export const useURLSearchParams = (defaultValues = {}) => {
  const location = useLocation();
  const history = useHistory();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // on mount, set default values
  useEffect(() => {
    Object.keys(defaultValues).forEach(key => {
      if(!searchParams.has(key)) {
        searchParams.set(key, defaultValues[key].toString());
      }
    });
    history.replace({ search: searchParams.toString() });
  }, []);

  // return an object of key value pairs matching the search params to be used in list query
  const queryObject = useMemo(() => {
    const obj = {};
    searchParams?.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams]);

  // accepts an object of key/value pairs to update OR a single key/value pair as before, useful for updating multiple params at once
  const setURLParams = useCallback((...args) => {
    if(args.length === 2) {
      const [key, value] = args;
      if(searchParams?.get(key) !== value) {
        searchParams?.set(key, value);
      }
      history.push({ search: searchParams?.toString() });
    } else if(args.length === 1 && typeof args[0] === 'object') {
      const [obj] = args;
      Object.keys(obj).forEach(key => {
        if(searchParams?.get(key) !== obj[key]) {
          searchParams?.set(key, obj[key]);
        }
      });
      history.push({ search: searchParams?.toString() });
    } else {
      throw new Error('useURLSearchParams: `handleChange` must be called with either a key/value pair or an object of key/value pairs, received: ' + args + '.');
    }
  }, [searchParams, history]);


  return [queryObject, setURLParams];
}