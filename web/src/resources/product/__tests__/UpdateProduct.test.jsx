// UpdateProduct.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import UpdateProduct from '../views/UpdateProduct';
import WaitOn from '../../../global/components/helpers/WaitOn';
import * as productService from '../productService'; // We'll mock this
import { mockUseGetUpdatableProduct, mockProduct } from '../__mocks__/ProductService';

import { initStore } from '../../../config/store';

const { copy } = WaitOn;

// We mock the service hook
jest.mock('../productService', () => ({
  useGetUpdatableProduct: jest.fn(),
}));

// Prepare a store
const store = initStore({
  _id: 'loggedInUserId',
  username: 'loggedInUsername@test.com',
});

// Helper to render UpdateProduct with provided hook overrides
const renderComponent = (overrides = {}) => {
  productService.useGetUpdatableProduct.mockReturnValue(
    mockUseGetUpdatableProduct(overrides)
  );

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/products/edit/${mockProduct._id}`]}>
        <Route path="/products/edit/:id">
          <UpdateProduct />
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

// Basic Rendering
test('renders UpdateProduct with the product title in the header', () => {
  renderComponent();

  expect(screen.getByText(new RegExp('Update Existing Product', 'i'))).toBeInTheDocument();
});

// Loading State
test('displays a loading message while fetching product data is in progress', () => {
   // Set up a state that indicates loading
   const loadingOverrides = {
    isLoading: true
    , isFetching: true
    , isSuccess: false
    , data: null
  };
  renderComponent(loadingOverrides);

  expect(screen.getByText(/Loading\.+/i)).toBeInTheDocument();
});

// Error State
test('displays server error message when update query fails', () => {
  const errorOverrides = {
    isError: true,
    error: 'Server error',
    isLoading: false,
    isFetching: false,
    isSuccess: false
  };

  renderComponent(errorOverrides);

  expect(screen.getByText(/Server error/i)).toBeInTheDocument();
});

test('displays generic error message if an error is flagged but no error text is provided', () => {
  const errorOverrides = {
    isError: true,
    error: null,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
  };
  renderComponent(errorOverrides);

  expect(screen.getByText(copy.fetchError.trim())).toBeInTheDocument();
});

test('allows refetching on error', () => {
  const refetchMock = jest.fn();
  const errorOverrides = {
    isError: true,
    error: 'Fail',
    refetch: refetchMock,
  };

  renderComponent(errorOverrides);

  const refetchButton = screen.getByText(copy.refetchButton);
  fireEvent.click(refetchButton);
  expect(refetchMock).toHaveBeenCalled();
});

// Empty State
test('displays a message when product data is empty (no default item)', () => {
  const emptyOverrides = {
    data: null,
    isEmpty: true,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
  };

  renderComponent(emptyOverrides);

  expect(screen.getByText(/No data found/i)).toBeInTheDocument();
});

// Form Interaction
test('renders the product form with existing product data', () => {
  renderComponent({ data: mockProduct });

  const titleInput = screen.getByLabelText(/Title/i);
  const descriptionInput = screen.getByLabelText(/Description/i);
  const featuredCheckbox = screen.getByLabelText(/Featured/i);

  expect(titleInput).toBeInTheDocument();
  expect(descriptionInput).toBeInTheDocument();
  expect(featuredCheckbox).toBeInTheDocument();

  expect(titleInput).toHaveValue(mockProduct.title);
  expect(descriptionInput).toHaveValue(mockProduct.description);
  mockProduct.featured ? expect(featuredCheckbox).toBeChecked : expect(featuredCheckbox).not.toBeChecked();
});

test('calls handleSubmit when form is submitted', () => {
  const handleSubmitMock = jest.fn((e) => {
    e.preventDefault();
    return e.target;
  });

  renderComponent({ handleSubmit: handleSubmitMock });

  const form = screen.getByRole('form');
  fireEvent.submit(form);

  expect(handleSubmitMock).toHaveBeenCalled();
});
