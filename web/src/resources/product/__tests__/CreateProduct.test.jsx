// CreateProduct.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import CreateProduct from '../views/CreateProduct';
import WaitOn from '../../../global/components/helpers/WaitOn';
import * as productService from '../productService'; // We'll mock this
import { mockUseCreateProduct, mockProduct } from '../__mocks__/ProductService';

import { initStore } from '../../../config/store';
import { vi } from 'vitest';

const { copy } = WaitOn;

// We mock the service hook
vi.mock('../productService', () => ({
  useCreateProduct: vi.fn(),
}));

// Prepare a store
const store = initStore({
  _id: 'loggedInUserId',
  username: 'loggedInUsername@test.com'
});

// Helper to render CreateProduct with provided hook overrides
const renderComponent = (overrides = {}) => {
  productService.useCreateProduct.mockReturnValue(
    mockUseCreateProduct(overrides)
  );

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/products/new']}>
        <Route path="/products/new">
          <CreateProduct />
        </Route>
      </MemoryRouter>
    </Provider>
  );
};


// Basic Rendering
test('renders CreateProduct with a "New Product" title', () => {
  renderComponent();

  expect(screen.getByText(/New Product/i)).toBeInTheDocument();
});

// Loading State
test('displays a loading message while creating product is in progress', () => {
  // Set up a state that indicates loading
  const loadingOverrides = {
    isLoading: true
    , isFetching: true
    , isSuccess: false
    , data: null
  };
  renderComponent(loadingOverrides);

  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
});

// Error State
test('displays server error message when creation query fails', () => {
  const errorOverrides = {
    isError: true,
    error: 'Server error',
    isLoading: false,
    isFetching: false,
    isSuccess: false
  };

  renderComponent(errorOverrides);

  // WaitOn by default shows a short "An error occurred" + a "Refetch" button
  expect(screen.getByText(/Server error/i)).toBeInTheDocument();
});

test('displays generic error message if an error is flagged but no error text is given', () => {
  const errorOverrides = {
    isError: true,
    error: null,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
  };

  renderComponent(errorOverrides);

  // WaitOn has a default text for unknown errors
  expect(screen.getByText(copy.fetchError.trim())).toBeInTheDocument();
});

test('allows refetching on error', () => {
  const refetchMock = vi.fn();
  const errorOverrides = {
    isError: true,
    error: 'Fail',
    refetch: refetchMock
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
test('renders the product form with default data', () => {
  // By default, the mock product is used as initial data in the mock
  // or you can pass your own data override
  renderComponent({data: { title: '', description: '', featured: false }});
  const titleInput = screen.getByLabelText(/Title/i);
  const descriptionInput = screen.getByLabelText(/Description/i);
  const featuredCheckbox = screen.getByLabelText(/Featured/i);

  expect(titleInput).toBeInTheDocument();
  expect(descriptionInput).toBeInTheDocument();
  expect(featuredCheckbox).toBeInTheDocument();

  expect(titleInput).toHaveValue('');
  expect(descriptionInput).toHaveValue('');
  expect(featuredCheckbox).not.toBeChecked();
});

test('calls handleSubmit when form is submitted', () => {
  const handleSubmitMock = vi.fn((e) => {
    e.preventDefault();
    return e.target;
  })
  renderComponent({ handleSubmit: handleSubmitMock });

  const form = screen.getByRole('form');
  fireEvent.submit(form);

  expect(handleSubmitMock).toHaveBeenCalled();
});

