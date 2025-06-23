
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';

import SingleProduct from '../views/SingleProduct';
import WaitOn from '../../../global/components/helpers/WaitOn';
import { mockUseGetUpdatableProduct, mockProduct } from '../__mocks__/ProductService';
import * as productService from '../productService'; // Mock service
import { vi } from 'vitest';


const { copy } = WaitOn;

vi.mock('../productService', () => ({
  useGetUpdatableProduct: vi.fn(),
}));

import { initStore } from '../../../config/store';

const store = initStore({ _id: 'loggedInUserId', username: 'loggedInUsername@test.com' });
const renderComponent = (overrides = {}) => {
  productService.useGetUpdatableProduct.mockReturnValue(mockUseGetUpdatableProduct(overrides));
  return render(
    // this mimics the store and router setup in the main app in /src/index.js
    <Provider store={store}>
      <MemoryRouter initialEntries={['/products/1']}>
        <Route path="/products/:productId">
          <SingleProduct />
        </Route>
      </MemoryRouter>
    </Provider>
  );
};


// Basic Rendering
test('renders product details correctly', () => {
  renderComponent();
  
  expect(screen.getByText(/Product details/i)).toBeInTheDocument();
  expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
  expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
});

// Loading State
const loadingOverrides = { isLoading: true, isFetching: true, isSuccess: false, isError: false, data: null };
test('displays a loading skeleton while fetching', () => {
  renderComponent(loadingOverrides);

  expect(screen.getByText(/Product Title/i)).toBeInTheDocument(); // Skeleton text
});

// Error State
const errorOverrides = { data: null, isError: true, error: 'An error occurred', isLoading: false, isFetching: false, isSuccess: false };
test('displays server error message when query fails', () => {
  renderComponent(errorOverrides);

  expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
});

test('displays generic error message when query fails without an error message', () => {
  renderComponent({ ...errorOverrides, error: null });

  expect(screen.getByText(copy.fetchError.trim())).toBeInTheDocument();
});

test('displays a working refetch button when fetching product data fails', () => {
  const refetchMock = vi.fn();
  renderComponent({ ...errorOverrides, refetch: refetchMock });

  const refetchButton = screen.getByText(copy.refetchButton);
  expect(refetchButton).toBeInTheDocument();

  fireEvent.click(refetchButton);
  expect(refetchMock).toHaveBeenCalled();
});

// This test doesn't work because jest automatically fails the test when an error is thrown regardless of whether it is caught and handled in the component.
// test('renders fallback error message when children throw an error', () => {
//   // Simulate a child component that throws an error
//   const ErrorComponent = () => {
//     return <div>{null.map(() => null)}</div>;
//   };

//   // Mock query state for WaitOn
//   const queryState = {
//     isError: false,
//     isLoading: false,
//     isEmpty: false,
//     isFetching: false,
//     isSuccess: true,
//     data: mockProduct,
//   };

//   render(
//     <WaitOn query={queryState}>
//       <ErrorComponent />
//     </WaitOn>
//   );

//   // Assert the fallback error UI is rendered
//   expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
//   expect(screen.getByText(/Try again/i)).toBeInTheDocument();
// });

// Empty State
const emptyOverrides = { data: null, isEmpty: true, isLoading: false, isFetching: false, isSuccess: true };
test('displays a message when product data is empty', () => {
  renderComponent(emptyOverrides);

  expect(screen.getByText(/No data found/i)).toBeInTheDocument();
});

// Toggle Featured
test('calls sendMutation when "Toggle Featured" is clicked', async () => {
  const sendMutationMock = vi.fn().mockResolvedValue({ payload: { featured: true } });
  renderComponent({ sendMutation: sendMutationMock });

  fireEvent.click(screen.getByText(/Toggle Featured/i));
  await waitFor(() => expect(sendMutationMock).toHaveBeenCalledWith({ featured: true }));
});

// Checkbox Interaction
test('calls handleChange when the "Featured" checkbox is toggled', () => {
  const handleChangeMock = vi.fn();
  renderComponent({ handleChange: handleChangeMock });

  const checkbox = screen.getByLabelText(/Featured/i);
  fireEvent.click(checkbox);

  expect(handleChangeMock).toHaveBeenCalledWith(expect.objectContaining({ target: { name: 'featured', value: true } }));
});

// Ensure Featured Checkbox is Enabled
test('renders an enabled checkbox with the correct featured state', () => {
  renderComponent({ data: { ...mockProduct, featured: true } });

  const checkbox = screen.getByLabelText(/Featured/i);
  expect(checkbox).toBeChecked();
});



// Cancel and Save Buttons
test('renders "Cancel" and "Save" buttons when product is changed', () => {
  renderComponent({ isChanged: true });

  expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  expect(screen.getByText(/Save/i)).toBeInTheDocument();
});


test('calls resetFormState when "Cancel" is clicked', () => {
  const resetFormStateMock = vi.fn();
  renderComponent({ isChanged: true, resetFormState: resetFormStateMock });

  fireEvent.click(screen.getByText(/Cancel/i));
  expect(resetFormStateMock).toHaveBeenCalled();
});

test('calls handleSubmit when "Save" is clicked', () => {
  const handleSubmitMock = vi.fn();
  renderComponent({ isChanged: true, handleSubmit: handleSubmitMock });

  fireEvent.click(screen.getByText(/Save/i));
  expect(handleSubmitMock).toHaveBeenCalled();
});

// Navigation
test('navigates to update product page when "Update Product" is clicked', () => {
  renderComponent();

  const updateLink = screen.getByText(/Update Product/i);
  expect(updateLink).toHaveAttribute('href', '/products/1/update');
});






