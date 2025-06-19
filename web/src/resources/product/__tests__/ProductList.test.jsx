// ProductList.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import ProductList from '../views/ProductList';
import { mockUseGetProductList, mockUseProductFromMap } from '../__mocks__/ProductService'; // Mock data
import * as productService from '../productService'; // Mock service
import { initStore } from '../../../config/store';
import { vi } from 'vitest';

vi.mock('../productService', () => ({
  useGetProductList: vi.fn(),
  useProductFromMap: vi.fn(),
}));

const store = initStore({ _id: 'loggedInUserId', username: 'loggedInUsername@test.com' });

const renderComponent = (overrides = {}) => {
  productService.useGetProductList.mockReturnValue(mockUseGetProductList(overrides));
  productService.useProductFromMap.mockImplementation(mockUseProductFromMap);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/products']}>
        <Route path="/products">
          <ProductList />
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

// Basic Rendering
test('renders the product list correctly', () => {
  renderComponent();
  expect(screen.getByText(/Product List/i)).toBeInTheDocument();
  expect(screen.getByText(/New Product/i)).toBeInTheDocument();
});

// Loading State
test('displays the `pagination.per` number of loading skeleton items while fetching data', () => {
  renderComponent({ isLoading: true, isFetching: true, data: null, page: 1, per: 10 });
  const skeletonListItems = screen.getAllByText(/This is a sample product description/i);
  expect(skeletonListItems.length).toBe(10);
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
test('renders pagination controls and updates page on interaction', () => {
  renderComponent();
  const container = screen.getByText(/Page/).closest('span').parentNode; // Parent container
  expect(container).toHaveTextContent('Page 1 of 5');
  const nextPageButton = screen.getByText(/Next/i);
  fireEvent.click(nextPageButton);
  expect(container).toHaveTextContent('Page 2 of 5');
  const prevPageButton = screen.getByText(/Previous/i);
  fireEvent.click(prevPageButton);
  expect(container).toHaveTextContent('Page 1 of 5');
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
