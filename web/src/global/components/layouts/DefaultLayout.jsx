/**
 * Will act as the default wrapper for all module states within the application
 * that call it within their own Layouts
 */

// import primary libraries
import React, { useEffect } from 'react';
import PropTypes from 'prop-types'
import Spinner from '../helpers/Spinner.jsx';

// import nav components
import DefaultNav from '../navigation/DefaultNav.jsx';


const DefaultLayout = ({
  children
  , className = ''
  , title
}) => {

  // Set the document title based on the title prop
  // If no title is provided, set it to "Yote App"
  useEffect(() => {
    document.title = title ? `${title} | Yote` : "Yote App";
  }, [title])

  return (
    <div>
      <DefaultNav />
      <main className={`py-10 px-2 container mx-auto ${className}`}>
        {children}
      </main>
    </div>
  )
}

DefaultLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node)
    , PropTypes.node
  ]).isRequired
  , className: PropTypes.string
  , title: PropTypes.string
}


DefaultLayout.Skeleton = (props) => {
  return (
    <DefaultLayout title="Loading..." {...props}>
      <Spinner />
    </DefaultLayout>
  )
}

export default DefaultLayout;
