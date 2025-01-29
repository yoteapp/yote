// SearchableProductList.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import SearchableProductList from '../views/SearchableProductList';
import { generateMockProductMap, mockUseGetProductList, mockUseProductFromMap } from '../__mocks__/ProductService'; // Mock data
import * as productService from '../productService'; // Mock service
import * as customHooks from '../../../global/utils/customHooks';
import { initStore } from '../../../config/store';

jest.mock('../productService', () => ({
  useGetProductList: jest.fn(),
  useProductFromMap: jest.fn(),
}));

jest.mock('../../../global/utils/customHooks', () => ({
  useURLSearchParams: jest.fn(),
  usePagination: jest.fn(),
}));

const store = initStore({ _id: 'loggedInUserId', username: 'loggedInUsername@test.com' });

const renderComponent = (overrides = {}) => {
  customHooks.useURLSearchParams.mockImplementation((newParams) => [{ page: 1, per: 25, sort: '-updated', textSearch: '', ...newParams }, jest.fn()]);
  productService.useGetProductList.mockReturnValue(mockUseGetProductList(overrides));
  productService.useProductFromMap.mockImplementation((id) => mockUseProductFromMap(id, overrides.customMap));
  
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/products']}>
        <Route path="/products">
          <SearchableProductList />
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

// Basic Rendering
test('renders the searchable product list correctly', () => {
  renderComponent();
  expect(screen.getByText(/Product List/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Search Products/i)).toBeInTheDocument();
  expect(screen.getByText(/New Product/i)).toBeInTheDocument();
});

// Loading State
test('displays the `pagination.per` number of loading skeleton items while fetching data', () => {
  const customProductMap = generateMockProductMap(50);
  renderComponent({ customMap: customProductMap, isLoading: true, isFetching: true, isSuccess: false, data: null, pagination: { page: 1, per: 7, totalPages: 8, totalCount: 50 } });
  const skeletonListItems = screen.getAllByText(/This is a sample product description/i);
  expect(skeletonListItems.length).toBe(7);
});

// Empty State
test('displays a message when no products are found', () => {
  renderComponent({ data: [], isEmpty: true });
  expect(screen.getByText(/No data found/i)).toBeInTheDocument();
});

// Error State
test('displays an error message if data fetching fails', () => {
  renderComponent({ isError: true, error: 'Failed to fetch products' });
  expect(screen.getByText(/Failed to fetch products/i)).toBeInTheDocument();
});

// Pagination Controls
test('displays pagination controls', () => {
  renderComponent({ pagination: { page: 1, per: 10, totalPages: 3, totalCount: 30 } });
  const container = screen.getByText(/Page/).closest('span').parentNode; // Parent container
  expect(container).toHaveTextContent('Page 1 of 3');
  expect(screen.getByText(/Previous/i)).toBeInTheDocument();
  expect(screen.getByText(/Next/i)).toBeInTheDocument();
});

// List Rendering
test('renders a list of products when data is available', () => {
  renderComponent({ data: [{ _id: '1', name: 'Product 1' }, { _id: '2', name: 'Product 2' }] });
  expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Product 2/i)).toBeInTheDocument();
});


// "New Product" Navigation
test('navigates to the "New Product" page when button is clicked', () => {
  renderComponent();
  const newProductLink = screen.getByText(/New Product/i);
  expect(newProductLink).toHaveAttribute('href', '/products/new');
});
