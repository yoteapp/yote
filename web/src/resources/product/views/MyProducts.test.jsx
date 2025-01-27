// MyProducts.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import MyProducts from './MyProducts';
import { mockUseProductListByLoggedIn, mockUseProductFromMap, mockUseUpdateProductByLoggedInUser } from '../__mocks__/ProductService'; // Mock data
import * as productService from '../productService'; // Mock service
import { initStore } from '../../../config/store';

jest.mock('../productService', () => ({
  useProductListByLoggedIn: jest.fn(),
  useProductFromMap: jest.fn(),
  useUpdateProductByLoggedInUser: jest.fn(),
}));

const store = initStore({ _id: 'loggedInUserId', username: 'loggedInUsername@test.com' });

const renderComponent = (overrides = {}) => {
  productService.useProductListByLoggedIn.mockReturnValue(mockUseProductListByLoggedIn(overrides));
  productService.useProductFromMap.mockImplementation(mockUseProductFromMap);
  productService.useUpdateProductByLoggedInUser.mockReturnValue(mockUseUpdateProductByLoggedInUser());
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/products/mine']}>
        <Route path="/products/mine">
          <MyProducts />
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

// Basic Rendering
test('renders the "My Products" list correctly', () => {
  renderComponent();
  // expect(screen.getByText(/My Products/i)).toBeInTheDocument();
  // My Products is a link in the nav and the page title. Need to test by element type
  expect(screen.getByRole('heading', { name: /My Products/i })).toBeInTheDocument();
  expect(screen.getByText(/New Product With Restrictions/i)).toBeInTheDocument();
});

// Loading State
test('displays the `pagination.per` number of loading skeleton items while fetching data', () => {
  renderComponent({ isLoading: true, isFetching: true, data: null, page: 1, per: 10 });
  const skeletonListItems = screen.getAllByText(/This is my sample product description/i);
  expect(skeletonListItems.length).toBe(10);
});

// Empty State
test('displays a message when no products are found', () => {
  renderComponent({ data: [], isEmpty: true });
  expect(screen.getByText(/No Products Found/i)).toBeInTheDocument();
  expect(screen.getByText(/You have not created any products yet/i)).toBeInTheDocument();
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
  // expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
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

// "New Product With Restrictions" Navigation
test('navigates to the "New Product With Restrictions" page when button is clicked', () => {
  renderComponent();
  const newProductLink = screen.getByText(/New Product With Restrictions/i);
  expect(newProductLink).toHaveAttribute('href', '/products/new-with-restriction');
});
