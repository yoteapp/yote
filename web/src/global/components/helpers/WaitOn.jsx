
import React from 'react'
import PropTypes from 'prop-types'
import Spinner from './Spinner';

// deals with fetch info supplied by query hooks and displays loading and error states if applicable.
// only renders children when the fetch is done.
const WaitOn = ({
  fallback = (<Spinner />)
  , query
  , children
  , empty
}) => {

  const {
    isError: fetchError
    , error
    , isLoading
    // , isFetching
    , isEmpty
    , refetch
  } = query;

  try {
    if(!query) return null;
    // there was an error fetching data
    if(fetchError) return <div className="p-8 whitespace-nowrap">{error || copy.fetchError} {refetch && <button className='btn' onClick={refetch}>{copy.refetchButton}</button>}</div>
    // still waiting for data
    if(isLoading) return fallback;
    // fetch returned empty
    if(isEmpty) return empty || <div className="p-8 whitespace-nowrap"><p className="text-gray-500 italic text-center block">{copy.empty}</p></div>
    // fetch is done. render children to display the fetched data
    return children || null;
  } catch(childError) {
    // debugging
    // console.log('Error in WaitOn children ', childError);
    // there was an error thrown by the children, but the app will not crash, it will display an error message instead.
    // Could somehow log this error or save it as a userEvent kind of thing. Could make it easier to track bugs over time.
    return <div className="p-8 whitespace-nowrap">{copy.childError} <button className='btn' onClick={window.location.reload}>{copy.refetchButton}</button></div>
  }
}

WaitOn.propTypes = {
  fallback: PropTypes.node
  , query: PropTypes.object.isRequired
  , children: PropTypes.node
  , empty: PropTypes.node
}

const copy = {
  refetchButton: 'Try again'
  , empty: 'No data found'
  , fetchError: 'Oops, there was an error. '
  , childError: 'Something went wrong. '
}
WaitOn.copy = copy;

export default WaitOn;
