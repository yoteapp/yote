# Front-End State Management in Yote

## Overview

Yote employs a unique pattern for managing front-end state by using Redux Toolkit to maintain a normalized cache of server data. This approach diverges slightly from the typical use of Redux but has proven to be a powerful pattern for managing data in a client-side application. Each resource in the application is represented in the global Redux state, which allows for modular and reusable logic for CRUD operations, as well as minimizing requests to the server. This document outlines how we handle state management for resources, with `Product` as the example resource.

## Resource Service Files

Each resource has a corresponding service file (e.g., `productService.jsx`) that:

1. Defines hooks for CRUD operations and other interactions, leveraging the shared hooks from the `serviceHooks.js` file.
2. Simplifies access to the Redux store by abstracting away the need for `dispatch`, `connect`, or `mapStateToProps`.
3. Provides a clear and uniform API for working with resource data.

### Generated CRUD Hooks

The following hooks are defined on a resource specific level in each generated service file leveraging the shared hooks described below where `resource` would be replaced with your resource name (e.g., `useCreateProduct`).

#### Create

The `useCreateResource` hook is used to create a new resource. It includes:

- `data`: The current state of the new resource.
- `handleChange`: A form handler to manage input changes.
- `handleSubmit`: A form submit handler to trigger the creation action.
- `setFormState`: Directly update the form state, if needed.

Example usage:

```jsx
const { data: newProduct, handleChange, handleSubmit } = useCreateProduct({
  initialState: { someKey: 'someValue' },
  onResponse: (product, error) => {
    if (error) alert(error);
    else history.push(`/products/${product._id}`);
  },
});
```

#### Read

- `useGetDefaultProduct`: Fetches the default resource (useful for creating new items).
- `useGetResourceById`: Fetches a specific resource by ID.
- `useGetResource`: Fetches a single resource based on query arguments.
- `useGetResourceList`: Fetches a list of resources based on query arguments.

Example usage:

```jsx
const { data: product, isLoading } = useGetProductById(productId);
```

#### Update

- `useUpdateResource`: Provides access to the update action for an existing resource.
- `useGetUpdatableResource`: Combines fetching and updating into a single hook.

Example usage:

```jsx
const { data: product, handleChange, handleSubmit } = useGetUpdatableProduct(productId, {
  onResponse: (updatedProduct, error) => {
    if (error) alert(error);
    else history.push(`/products/${productId}`);
  },
});
```

#### Delete

- `useDeleteResource`: Provides access to the delete action.

Example usage:

```jsx
const { sendDeleteProduct } = useDeleteProduct();
sendDeleteProduct(productId);
```

## Redux Store

Each resource has its own slice file (e.g., `productStore.js`) that:

1. Defines the resource’s initial state.
2. Implements reducers for CRUD actions.
3. Tracks the status of server requests using `extraReducers`.
4. Utilizes `createAsyncThunk` to handle API calls.

### State Structure

The Redux state for a resource includes:

- `byId`: A map of resources keyed by their IDs.
- `singleQueries`: Metadata for single-resource queries.
- `listQueries`: Metadata for list-resource queries.

Example initial state:

```javascript
const initialState = {
  byId: {},
  singleQueries: {},
  listQueries: {},
};
```

### Shared Utilities

`storeUtils.js` provides common handlers for state manipulation:

- `handleFetchSingleFulfilled`: Updates the store with a single resource.
- `handleFetchListFulfilled`: Updates the store with a list of resources.
- `handleMutationFulfilled`: Handles resource creation and updates.
- `handleInvalidateQuery`: Marks a query as invalidated to trigger a refetch.

Example usage in `extraReducers`:

```javascript
.addCase(fetchSingleProduct.fulfilled, handleFetchSingleFulfilled)
.addCase(fetchProductList.fulfilled, (state, action) => handleFetchListFulfilled(state, action, 'products'))
```

## Query Management

### Query Expiration

Queries include an `expirationDate` to ensure data freshness. The `shouldFetch` utility determines whether a fetch is needed based on:

- Query presence.
- Query status (`pending`, `fulfilled`, `rejected`).
- Expiration time.
- Invalidated status.

### Pagination and Prefetching

The `useGetResourceList` hook includes built-in pagination and prefetching:

- Automatically fetches the next page of resources.
- Simplifies pagination logic for components.

Example usage:

```jsx
const { data: products, pagination } = useGetProductList({ page: 1, per: 10 });
```

## Custom Endpoints

Aside from the boilerplate CRUD api, Yote provides a simple way to define custom endpoints for various special cases (see productService.js for more details):

- `useProductByLoggedIn`: Fetches resources created by the logged-in user via a custom product api endpoint.
- `useUpdateProductByLoggedInUser`: Updates a resource with additional authorization logic via a custom product api endpoint.

## Best Practices

1. **Consistency**: Follow the CRUD and hook patterns outlined above to ensure maintainable and reusable code.
2. **State Isolation**: Keep each resource’s state isolated within its slice.
3. **Use Utilities**: Leverage shared utilities for common state manipulations and API calls.
4. **Custom Logic**: Encapsulate resource-specific logic in custom hooks for clarity and reuse.

---

This approach ensures scalable and maintainable front-end state management in Yote applications.

