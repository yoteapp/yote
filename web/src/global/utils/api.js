/**
 * This is a utility to handle default API requests with the Yote server
 */

import _ from 'lodash'
// TODO: break this into separate exports so we aren't forced to import the entire set to use one method.

const apiUtils = {
  async callAPI(route, method = 'GET', body, headers = {
    'Accept': 'application/json', 'Content-Type': 'application/json',
  }) {
    const response = await fetch(route, {
      headers,
      method,
      credentials: 'same-origin',
      body: JSON.stringify(body)
    });
    if(response.status && response.status === 401) {
      // console.log("REDIRECT ME")
      /**
       * thoughts here. we want a way to loudly fail when the user is auto-logged out
       * vs silently breaking
       * i think a hard (non-redux) redirect is the way to go, since it should 
       * refresh the user from the server and wipe anything currently in the store
      */
     window.location.reload(); // preserve location on redirect
     
     // response.ok info: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
    } else if(response.ok) {
      return response.json();
    } else {
      const error = await response.json().catch(unhandledError => {
        // catch unhandled server errors
        console.error('Unhandled Error Thrown by Server. Not cool.', unhandledError)
        throw 'Something went wrong';
      });
      throw error;
    }
  }

  , queryStringFromObject(queryObject) {
    // console.log("QUERY STRING FROM OBJECT")
    if(!queryObject) return "";
    if(queryObject === "all") return "";
    // ex: { page: '1', per: '20' } to ?page=1&per=20
    return Object.entries(queryObject)
      // remove empties
      .filter(entry => entry[1] && entry[1].toString().length > 0)
      // .filter(entry => entry[1] && entry[1].toString().length > 0)
      .map(item => {
        // debugging
        // console.log(item);
        return item;
      })
      // if value is array, convert to string, otherwise just add the string
      .map(entry => Array.isArray(entry[1]) ? [entry[0], entry[1].join(",")] : entry)
      // map to string
      .map(entry => entry.join("="))
      .join("&")
  }
  , objectFromQueryString(queryString) {
    // convert search string into object notation
    // ex: ?page=1&per=20 to { page: '1', per: '20' }
    // first grab just the query string meaning everything after the ?
    queryString = queryString?.split("?")[1];
    if(!queryString) return {};
    return queryString.replace("?", "").split("&")
      .map(item => item.split("="))
      .map(item => [_.camelCase(item[0]), item[1]]) // convert kebab case to camel case, ie. "end-date" => "endDate"
      // .map(item => {
      //   // debugging
      //   console.log(item);
      //   return item;
      // })
      // if "" dont add it, otherwise add key:value to return object
      .reduce((returnObj, item) => { return item[0].length > 0 ? { ...returnObj, [item[0]]: item[1] } : returnObj }, {})
  }
  /**
   * Checks if listArgs are ready to be fetched
   * returns false if listArgs is falsy, or an object with any undefined or empty array values
   * returns true if listArgs is an object with no undefined or empty array values (this includes an empty object which is a valid listArgs)
   * @param {object} listArgs - an object containing the listArgs to be checked
   */
  , checkListArgsReady(listArgs) {
    // can't fetch if no list args are provided
    if(!listArgs) return false;
    if(typeof listArgs !== "object") return false;
    let listArgsReady = true;
    // if ANY list args are undefined or an array with 0 length, flip the boolean false
    Object.keys(listArgs).forEach(key => {
      const value = listArgs[key];
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      const valueIsEmpty = isEmptyArray || value === undefined;

      if(valueIsEmpty) {
        listArgsReady = false;
      }
    });
    return listArgsReady;
  }
}

export default apiUtils;


