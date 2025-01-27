/**
 * This set of mocks is meant to be used in components that interact with the ProductService.
 * We can mock the return values of the hooks exported by the ProductService module to test
 * various states of the component.
 */



export const generateMockProductMap = (count) => {
  const map = {};
  for (let i = 0; i < count; i++) {
    map[i] = {
      _id: i.toString(),
      title: `Product ${i}`,
      description: 'This is a sample description',
      featured: false,
    };
  }
  return map;
}

export const generateListFromMap = (map) => {
  if (!map) return [];
  return Object.keys(map)?.map(key => map[key]);
}

const mockProductListCount = 50;

const mockProductMap = generateMockProductMap(mockProductListCount);

export const mockProduct = mockProductMap['1'];

export const mockProductList = generateListFromMap(mockProductMap);

export const mockUseGetUpdatableProduct = (overrides = {}) => ({
  data: mockProduct,
  handleChange: jest.fn(),
  handleSubmit: jest.fn(),
  isChanged: false,
  setFormState: jest.fn(),
  sendMutation: jest.fn(),
  resetFormState: jest.fn(),
  isFetching: false,
  isLoading: false,
  isError: false,
  isSuccess: true,
  ...overrides,
});

export const mockUseGetProductList = (overrides = {}) => {
  return {
    data: generateListFromMap(overrides.customMap || mockProductMap),
    ids: overrides.customMap ? Object.keys(overrides.customMap) : Object.keys(mockProductMap),
    setPage: jest.fn(),
    pagination: overrides.pagination || { page: 1, per: 10, totalPages: 5, totalCount: mockProductListCount },
    isFetching: false,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isEmpty: false,
    ...overrides,
  }
}

export const mockUseProductListByLoggedIn = (overrides = {}) => {
  return {
    data: generateListFromMap(overrides.customMap || mockProductMap),
    ids: overrides.customMap ? Object.keys(overrides.customMap) : Object.keys(mockProductMap),
    setPage: jest.fn(),
    pagination: overrides.pagination || { page: 1, per: 10, totalPages: 5, totalCount: mockProductListCount },
    isFetching: false,
    isLoading: false,
    isError: false,
    isSuccess: true,
    isEmpty: false,
    ...overrides,
  }
}

export const mockUseUpdateProductByLoggedInUser = (overrides = {}) => {
  return {
    mutate: jest.fn(),
    ...overrides,
  }
}

export const mockUseCreateProduct = (overrides = {}) => {
  return {
    data: mockProduct,
    handleChange: jest.fn(),
    handleSubmit: jest.fn(),
    isChanged: false,
    setFormState: jest.fn(),
    sendMutation: jest.fn(),
    resetFormState: jest.fn(),
    isFetching: false,
    isLoading: false,
    isError: false,
    isSuccess: false,
    ...overrides,
  }
}

export const mockUseProductFromMap = (id, customMap) => {
  if (customMap) {
    return customMap[id];
  }
  return mockProductMap[id];
}
