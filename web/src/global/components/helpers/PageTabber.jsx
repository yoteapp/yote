// @ts-check
import React from 'react'

import PropTypes from 'prop-types';

const PageTabber = ({
  pagination
  , setPage
  , totalPages
  , totalCount
  , onSetPage = () => { }
}) => {

  const handleSetPage = (newPage) => {
    onSetPage();
    setPage(newPage);
  }

  
  let before;
  let after;
  const currentPage = Number(pagination.page);

  /**
   * determine how many pages came before the current page and display (at most)
   * the three most recent
   */
  if(currentPage === 1) {
    before = [];
  } else if(currentPage === 2) {
    before = [1];
  } else if(currentPage === 3) {
    before = [1, 2];
  } else {
    before = [(currentPage - 3), (currentPage - 2), (currentPage - 1)];
  }

  /**
   * determine how many pages come after the current page and display (at most)
   * the next three
   */
  if(!totalPages || currentPage >= totalPages) {
    after = [];
  } else if(currentPage === totalPages - 1) {
    after = [currentPage + 1];
  } else if(currentPage === totalPages - 2) {
    after = [(currentPage + 1), (currentPage + 2)]
  } else {
    after = [(currentPage + 1), (currentPage + 2), (currentPage + 3)]
  }

  return (
    <div>
      &mdash;
      <p className="">
        <span className="">Page {currentPage}</span> of <span className="">{totalPages || "--"}</span>
      </p>
      <div className="">
        <nav className="" aria-label="Pagination">
          <button
            className='btn-xs btn-second border-none'
            onClick={() => handleSetPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span>Previous</span>
          </button>
          {currentPage > 4 ?
            <span>
              ...
            </span>
            :
            null
          }
          {before.map((page, i) => (
            <button
              className='btn-xs btn-second border-none'
              key={`page-before-${i}`}
              onClick={() => handleSetPage(page)}
            >
              {page}
            </button>
          ))}
          <span aria-current="page" className='btn-xs btn-second'>
            {currentPage}
          </span>
          {after.map((page, i) => (
            <button
              className='btn-xs btn-second border-none'
              key={`page-after-${i}`}
              onClick={() => handleSetPage(page)}
            >
              {page}
            </button>
          ))}
          {currentPage < totalPages - 3 ?
            <span>
              ...
            </span>
            :
            null
          }
          <button
            className='btn-xs btn-second border-none'
            onClick={() => handleSetPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span>Next</span>
          </button>
        </nav>
        <p className="">
          Showing <span className="">{(pagination.page * pagination.per) - (pagination.per - 1)}</span> to <span className="">{totalPages == 1 ? totalCount : pagination.page * pagination.per}</span> of{' '}
          <span className="">{totalCount}</span> results
        </p>
      </div>
    </div>
  )
}

PageTabber.propTypes = {
  pagination: PropTypes.shape({
    page: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
    , per: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  }).isRequired
  , totalPages: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  , totalCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  , setPage: PropTypes.func.isRequired
}

export default PageTabber;
