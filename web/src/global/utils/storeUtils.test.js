import {
  shouldFetch
  , convertListToMap
  , INITIAL_STATE
  , handleInvalidateQuery
  , handleInvalidateQueries
  , handleAddSingleToList
  , handleAddManyToList
  , handleRemoveManyFromList
  , handleUpdateManyInMap
  , handleCreateFulfilled
  , handleFetchSinglePending
  , handleFetchSingleFulfilled
  , handleFetchSingleFromListFulfilled
  , handleFetchSingleRejected
  , handleFetchListPending
  , handleFetchListFulfilled
  , handleFetchListRejected
  , handleMutationPending
  , handleMutationFulfilled
  , handleMutationRejected
  , handleMutateManyPending
  , handleMutateManyFulfilled
  , handleMutateManyRejected
  , handleDeletePending
  , handleDeleteFulfilled
  , handleDeleteRejected
  , handleFetchListIfNeeded
  , handleFetchSingleIfNeeded
  , selectListItems
  , selectSingleById
  , selectSingleByQueryKey
  , selectQuery
  , utilNewExpirationDate
  , parseQueryArgs
  , createEndpoint
} from './storeUtils';

import { vi } from 'vitest';

describe('storeUtils', () => {
  // Test shouldFetch function
  describe('shouldFetch', () => {
    it('should return true if query is undefined', () => {
      expect(shouldFetch(undefined)).toBe(true);
    });

    it('should return false if query status is pending', () => {
      const query = { status: 'pending' };
      expect(shouldFetch(query)).toBe(false);
    });

    it('should return false if query status is rejected', () => {
      const query = { status: 'rejected' };
      expect(shouldFetch(query)).toBe(false);
    });

    it('should return true if query has expired', () => {
      const query = { expirationDate: Date.now() - 1000 };
      expect(shouldFetch(query)).toBe(true);
    });

    it('should return query.didInvalidate if query is valid and not expired', () => {
      const query = { expirationDate: Date.now() + 10000, didInvalidate: true };
      expect(shouldFetch(query)).toBe(true);
      query.didInvalidate = false;
      expect(shouldFetch(query)).toBe(false);
    });
  });

  // Test convertListToMap function
  describe('convertListToMap', () => {
    it('should convert a list of items to a map by _id', () => {
      const items = [{ _id: '1', name: 'Item 1' }, { _id: '2', name: 'Item 2' }];
      const expected = {
        '1': { _id: '1', name: 'Item 1' },
        '2': { _id: '2', name: 'Item 2' },
      };
      expect(convertListToMap(items)).toEqual(expected);
    });

    it('should convert a list of items to a map by specified key', () => {
      const items = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }];
      const expected = {
        'a': { key: 'a', value: 1 },
        'b': { key: 'b', value: 2 },
      };
      expect(convertListToMap(items, 'key')).toEqual(expected);
    });

    it('should handle empty list', () => {
      expect(convertListToMap([])).toEqual({});
    });
  });

  // Test reducer handlers
  describe('Reducer Handlers', () => {
    let state;
    let action;

    beforeEach(() => {
      state = {
        ...INITIAL_STATE,
        byId: {
          '1': { _id: '1', name: 'Item 1' },
          '2': { _id: '2', name: 'Item 2' },
        },
        singleQueries: {
          '1': { id: '1', status: 'fulfilled', didInvalidate: false, error: null },
          '2': { id: '2', status: 'pending', didInvalidate: false, error: null },
        },
        listQueries: {
          'list1': { ids: ['1', '2'], status: 'fulfilled', didInvalidate: false, error: null },
          'list2': { ids: ['1', '2'], status: 'error', didInvalidate: false, error: 'something went wrong' },
          'list3': { ids: [], status: 'pending', didInvalidate: false, error: null },
          'list4': { ids: ['1', '2'], status: 'fulfilled', didInvalidate: true, error: null }
        },
      };
    });

    // handleInvalidateQuery
    describe('handleInvalidateQuery', () => {
      it('should set didInvalidate to true and clear error for existing query', () => {
        action = { payload: 'list2' };
        handleInvalidateQuery(state, action);
        expect(state.listQueries['list2'].didInvalidate).toBe(true);
        expect(state.listQueries['list2'].error).toBe(null);
      });

      it('should do nothing if query does not exist', () => {
        action = { payload: 'nonexistent' };
        handleInvalidateQuery(state, action);
        expect(state.listQueries['nonexistent']).toBeUndefined();
      });
    });

    describe('handleInvalidateQueries', () => {
      it('should set didInvalidate to true and clear error for multiple queries', () => {
        action = { payload: ['list1', 'list2'] };
        handleInvalidateQueries(state, action);
        expect(state.listQueries['list1'].didInvalidate).toBe(true);
        expect(state.listQueries['list1'].error).toBe(null);
        expect(state.listQueries['list2'].didInvalidate).toBe(true);
        expect(state.listQueries['list2'].error).toBe(null);
      });
    });

    // handleAddSingleToList
    describe('handleAddSingleToList', () => {
      it('should add a single ID to the list and remove duplicates', () => {
        action = { payload: { queryKey: 'list1', id: '3' } };
        handleAddSingleToList(state, action);
        expect(state.listQueries['list1'].ids).toContain('3');
        // Adding duplicate
        handleAddSingleToList(state, action);
        expect(state.listQueries['list1'].ids).toEqual(['1', '2', '3']);
      });

      it('should do nothing if query does not exist', () => {
        action = { payload: { queryKey: 'nonexistent', id: '3' } };
        handleAddSingleToList(state, action);
        expect(state.listQueries['nonexistent']).toBeUndefined();
      });
    });

    // handleAddManyToList
    describe('handleAddManyToList', () => {
      it('should add multiple IDs to the list and remove duplicates', () => {
        action = { payload: { queryKey: 'list1', ids: ['2', '3', '4'] } };
        handleAddManyToList(state, action);
        expect(state.listQueries['list1'].ids).toEqual(['1', '2', '3', '4']);
      });

      it('should initialize ids if they do not exist', () => {
        state.listQueries['list2'] = {};
        action = { payload: { queryKey: 'list2', ids: ['5', '6'] } };
        handleAddManyToList(state, action);
        expect(state.listQueries['list2'].ids).toEqual(['5', '6']);
      });

      it('should do nothing if query does not exist', () => {
        action = { payload: { queryKey: 'nonexistent', ids: ['5', '6'] } };
        handleAddManyToList(state, action);
        expect(state.listQueries['nonexistent']).toBeUndefined();
      });
    });

    // handleRemoveManyFromList
    describe('handleRemoveManyFromList', () => {
      it('should remove multiple IDs from the list', () => {
        action = { payload: { queryKey: 'list1', ids: ['1', '2'] } };
        handleRemoveManyFromList(state, action);
        expect(state.listQueries['list1'].ids).toEqual([]);
      });

      it('should not fail if IDs are not in the list', () => {
        action = { payload: { queryKey: 'list1', ids: ['3'] } };
        handleRemoveManyFromList(state, action);
        expect(state.listQueries['list1'].ids).toEqual(['1', '2']);
      });

      it('should do nothing if query does not exist', () => {
        action = { payload: { queryKey: 'nonexistent', ids: ['1'] } };
        handleRemoveManyFromList(state, action);
        expect(state.listQueries['nonexistent']).toBeUndefined();
      });
    });

    // handleUpdateManyInMap
    describe('handleUpdateManyInMap', () => {
      it('should update multiple items in byId', () => {
        const items = [
          { _id: '1', name: 'Updated Item 1' },
          { _id: '3', name: 'Item 3' },
        ];
        action = { payload: items };
        handleUpdateManyInMap(state, action);
        expect(state.byId['1'].name).toBe('Updated Item 1');
        expect(state.byId['3']).toEqual({ _id: '3', name: 'Item 3' });
      });
    });

    // handleCreateFulfilled
    describe('handleCreateFulfilled', () => {
      it('should add new resource to byId and invalidate lists', () => {
        action = { payload: { _id: '3', name: 'Item 3' } };
        handleCreateFulfilled(state, action);
        // should have added the new item to byId map
        expect(state.byId['3']).toEqual({ _id: '3', name: 'Item 3' });
        // should have created a new query for the new item
        expect(state.singleQueries['3'].status).toBe('fulfilled');
        // should have invalidated all lists
        expect(state.listQueries['list1'].didInvalidate).toBe(true);
        expect(state.listQueries['list2'].didInvalidate).toBe(true);
      });

      it('should preserve lists if preserveLists is true', () => {
        action = { payload: { _id: '3', name: 'Item 3' }, meta: { arg: { preserveLists: true } } };
        handleCreateFulfilled(state, action);
        expect(state.listQueries['list1'].didInvalidate).toBe(false);
        expect(state.listQueries['list2'].didInvalidate).toBe(false);
      });
    });

    // handleFetchSinglePending
    describe('handleFetchSinglePending', () => {
      it('should set status to pending and clear error', () => {
        action = { meta: { arg: '1' } };
        handleFetchSinglePending(state, action);
        expect(state.singleQueries['1'].status).toBe('pending');
        expect(state.singleQueries['1'].error).toBe(null);
      });
    });

    // handleFetchSingleFulfilled
    describe('handleFetchSingleFulfilled', () => {
      it('should set status to fulfilled and add expiration date', () => {
        action = { payload: { _id: '1', name: 'Item 1' }, meta: { arg: '1' } };
        handleFetchSingleFulfilled(state, action);
        expect(state.singleQueries['1'].status).toBe('fulfilled');
        expect(state.singleQueries['1'].expirationDate).toBeGreaterThan(Date.now());
      });
    });

    // handleFetchSingleFromListFulfilled
    describe('handleFetchSingleFromListFulfilled', () => {
      it('should set status to fulfilled and add expiration date', () => {
        action = { payload: { _id: '1', name: 'Item 1' }, meta: { arg: '1' } };
        handleFetchSingleFromListFulfilled(state, action, 'list1');
        expect(state.singleQueries['1'].status).toBe('fulfilled');
        expect(state.singleQueries['1'].expirationDate).toBeGreaterThan(Date.now());
      });
    });

    // handleFetchSingleRejected
    describe('handleFetchSingleRejected', () => {
      it('should set status to rejected and add error', () => {
        action = { payload: '1', error: { message: 'something went wrong' }, meta: { arg: '1' } };
        handleFetchSingleRejected(state, action);
        expect(state.singleQueries['1'].status).toBe('rejected');
        expect(state.singleQueries['1'].error).toBe('something went wrong');
      });
    });

    // handleFetchListPending
    describe('handleFetchListPending', () => {
      it('should set status to pending and clear error', () => {
        action = { meta: { arg: 'list1' } };
        handleFetchListPending(state, action);
        expect(state.listQueries['list1'].status).toBe('pending');
        expect(state.listQueries['list1'].error).toBe(null);
      });
    });

    describe('handleFetchListFulfilled', () => {
      beforeEach(() => {
        action = { payload: { products: [{ _id: '3', name: 'Item 3' }] }, meta: { arg: 'list3' } };
      });

      it('should set status to fulfilled', () => {
        handleFetchListFulfilled(state, action, 'products');
        expect(state.listQueries['list3'].status).toBe('fulfilled');
      });

      it('should add expiration date', () => {
        handleFetchListFulfilled(state, action, 'products');
        expect(state.listQueries['list3'].expirationDate).toBeGreaterThan(Date.now());
      });

      it('should add items to byId map', () => {
        handleFetchListFulfilled(state, action, 'products');
        expect(state.byId['3']).toEqual({ _id: '3', name: 'Item 3' });
      });

      it('should add ids to the list', () => {
        handleFetchListFulfilled(state, action, 'products');
        expect(state.listQueries['list3'].ids).toContain('3');
      });
    });


    // handleFetchListRejected
    describe('handleFetchListRejected', () => {
      it('should set status to rejected and add error', () => {
        action = { payload: null, error: { message: 'something went wrong' }, meta: { arg: 'list1' } };
        handleFetchListRejected(state, action);
        expect(state.listQueries['list1'].status).toBe('rejected');
        expect(state.listQueries['list1'].error).toBe('something went wrong');
      });
    });

    // handleMutationPending
    describe('handleMutationPending', () => {
      it('should set status to pending and clear error', () => {
        action = { meta: { arg: { _id: '1', newData: 'test new data' } } };
        handleMutationPending(state, action);
        expect(state.singleQueries['1'].status).toBe('pending');
        expect(state.singleQueries['1'].error).toBe(null);
      });
      it('should set previousVersion on the query', () => {
        action = { meta: { arg: { _id: '1', newData: 'test new data' } } };
        const previousVersion = { ...state.byId['1'] }
        handleMutationPending(state, action);
        expect(state.singleQueries['1'].previousVersion).toEqual(previousVersion);
      });
    });

    // handleMutationFulfilled
    describe('handleMutationFulfilled', () => {
      it('should set status to fulfilled, add expiration date, and update item in byId map', () => {
        action = { payload: { _id: '1', name: 'Updated Item 1' }, meta: { arg: { _id: '1', newData: 'test new data' } } };
        handleMutationFulfilled(state, action);
        expect(state.singleQueries['1'].status).toBe('fulfilled');
        expect(state.singleQueries['1'].expirationDate).toBeGreaterThan(Date.now());
        expect(state.byId['1'].name).toBe('Updated Item 1');
      });
    });

    // handleMutationRejected
    describe('handleMutationRejected', () => {
      it('should set status to rejected and add error', () => {
        action = { payload: '1', error: { message: 'something went wrong' }, meta: { arg: { _id: '1', newData: 'test new data' } } };
        handleMutationRejected(state, action);
        expect(state.singleQueries['1'].status).toBe('rejected');
        expect(state.singleQueries['1'].error).toBe('something went wrong');
      });
    });

    // handleMutateManyPending
    describe('handleMutateManyPending', () => {
      it('should set status to pending and clear error', () => {
        action = { meta: { arg: { ids: ['1', '2'], newData: 'test new data' } } };
        handleMutateManyPending(state, action);
        expect(state.singleQueries['1'].status).toBe('pending');
        expect(state.singleQueries['1'].error).toBe(null);
        expect(state.singleQueries['1'].previousVersion).toEqual(state.byId['1']);
        expect(state.singleQueries['2'].status).toBe('pending');
        expect(state.singleQueries['2'].error).toBe(null);
        expect(state.singleQueries['2'].previousVersion).toEqual(state.byId['2']);
      });
    });

    // handleMutateManyFulfilled
    describe('handleMutateManyFulfilled', () => {
      it('should set status to fulfilled, add expiration date, and update items in byId map', () => {
        action = { payload: { products: [{ _id: '1', name: 'Updated Item 1' }, { _id: '2', name: 'Updated Item 2' }] }, meta: { arg: { ids: ['1', '2'], newData: 'test new data' } } };
        handleMutateManyFulfilled(state, action, 'products');
        expect(state.singleQueries['1'].status).toBe('fulfilled');
        expect(state.singleQueries['1'].expirationDate).toBeGreaterThan(Date.now());
        expect(state.byId['1'].name).toBe('Updated Item 1');
        expect(state.singleQueries['2'].status).toBe('fulfilled');
        expect(state.singleQueries['2'].expirationDate).toBeGreaterThan(Date.now());
        expect(state.byId['2'].name).toBe('Updated Item 2');
      });
    });

    // handleMutateManyRejected
    describe('handleMutateManyRejected', () => {
      it('should set reset single queries on failure', () => {
        action = { payload: '1', error: { message: 'something went wrong' }, meta: { arg: { ids: ['1', '2'], newData: 'test new data' } } };
        handleMutateManyRejected(state, action);
        expect(state.singleQueries['1'].status).toBe('fulfilled');
        expect(state.singleQueries['1'].error).toBe(null);
        expect(state.singleQueries['2'].status).toBe('fulfilled');
        expect(state.singleQueries['2'].error).toBe(null);
      });
    });

    // handleDeletePending
    describe('handleDeletePending', () => {
      it('should set status to pending and clear error', () => {
        action = { meta: { arg: '1' } };
        handleDeletePending(state, action);
        expect(state.singleQueries['1'].status).toBe('pending');
        expect(state.singleQueries['1'].error).toBe(null);
      });
    });

    // handleDeleteFulfilled
    describe('handleDeleteFulfilled', () => {
      it('should remove item from byId and remove the single query', () => {
        action = { payload: { _id: '1' }, meta: { arg: '1' } };
        handleDeleteFulfilled(state, action);
        expect(state.byId['1']).toBeUndefined();
        expect(state.singleQueries['1']).toBeUndefined();
      });
    });

    // handleDeleteRejected
    describe('handleDeleteRejected', () => {
      it('should set status to rejected and add error', () => {
        action = { payload: '1', error: { message: 'something went wrong' }, meta: { arg: '1' } };
        handleDeleteRejected(state, action);
        expect(state.singleQueries['1'].status).toBe('rejected');
        expect(state.singleQueries['1'].error).toBe('something went wrong');
      });
    });

    // handleFetchListIfNeeded
    describe('handleFetchListIfNeeded', () => {
      const dispatchMock = vi.fn();
      const listFetchMock = vi.fn();
      const listFetchMock2 = vi.fn();
      it('should fetch list if query is invalidated', () => {
        // action = { meta: { arg: 'list3' } };
        handleFetchListIfNeeded(dispatchMock, state, listFetchMock, 'list4', 'products');
        expect(listFetchMock).toHaveBeenCalledWith('list4');
      });
      it('should not fetch list if query is fresh', () => {
        handleFetchListIfNeeded(dispatchMock, state, listFetchMock2, 'list1', 'products');
        expect(listFetchMock2).not.toHaveBeenCalled();
      });
    });

    // handleFetchSingleIfNeeded
    describe('handleFetchSingleIfNeeded', () => {
      const dispatchMock = vi.fn();
      const singleFetchMock = vi.fn();
      const singleFetchMock2 = vi.fn();
      it('should fetch single item if query is invalidated', () => {
        handleFetchSingleIfNeeded(dispatchMock, state, singleFetchMock, '3');
        expect(singleFetchMock).toHaveBeenCalledWith('3');
      });
      it('should not fetch single item if query is fresh', () => {
        handleFetchSingleIfNeeded(dispatchMock, state, singleFetchMock2, '1');
        expect(singleFetchMock2).not.toHaveBeenCalled();
      });
      it('should return existing item if query is fresh', async () => {
        const { payload, error } = await handleFetchSingleIfNeeded(dispatchMock, state, singleFetchMock2, '1');
        expect(payload).toEqual(state.byId['1']);
        expect(error).toBeNull();
      })
    });
  });

  // Test selectors
  describe('Selectors', () => {
    let resourceStore;

    beforeEach(() => {
      resourceStore = {
        byId: {
          '1': { _id: '1', name: 'Item 1' },
          '2': { _id: '2', name: 'Item 2' },
        },
        singleQueries: {
          '1': { id: '1', status: 'fulfilled', didInvalidate: false, error: null },
        },
        listQueries: {
          'list1': { ids: ['1', '2'], status: 'fulfilled', didInvalidate: false, error: null },
        },
      };
    });

    describe('selectListItems', () => {
      it('should return list items based on queryKey', () => {
        const items = selectListItems(resourceStore, 'list1');
        expect(items).toEqual([
          { _id: '1', name: 'Item 1' },
          { _id: '2', name: 'Item 2' },
        ]);
      });

      it('should return null if ids are not found', () => {
        const items = selectListItems(resourceStore, 'list2');
        expect(items).toBeNull();
      });
    });

    describe('selectSingleById', () => {
      it('should return single item by id', () => {
        const item = selectSingleById(resourceStore, '1');
        expect(item).toEqual({ _id: '1', name: 'Item 1' });
      });

      it('should return empty object for id "none"', () => {
        const item = selectSingleById(resourceStore, 'none');
        expect(item).toEqual({});
      });

      it('should return undefined for non-existing id', () => {
        const item = selectSingleById(resourceStore, '3');
        expect(item).toBeUndefined();
      });
    });

    describe('selectSingleByQueryKey', () => {
      it('should return single item based on queryKey', () => {
        const item = selectSingleByQueryKey(resourceStore, '1');
        expect(item).toEqual({ _id: '1', name: 'Item 1' });
      });

      it('should return undefined if query is not found', () => {
        const item = selectSingleByQueryKey(resourceStore, 'nonexistent');
        expect(item).toBeUndefined();
      });
    });

    describe('selectQuery', () => {
      it('should return query object for given queryKey', () => {
        const query = selectQuery(resourceStore, '1');
        expect(query).toEqual(resourceStore.singleQueries['1']);
      });

      it('should return empty object if queryKey is "none"', () => {
        const query = selectQuery(resourceStore, 'none');
        expect(query).toEqual({
          id: 'none',
          status: 'fulfilled',
          receivedAt: expect.any(Number),
          expirationDate: Infinity,
        });
      });

      it('should return empty object if query does not exist', () => {
        const query = selectQuery(resourceStore, 'nonexistent');
        expect(query).toEqual({});
      });
    });
  });

  // Test utility functions
  describe('Utility Functions', () => {
    describe('utilNewExpirationDate', () => {
      it('should return a timestamp 5 minutes in the future', () => {
        const now = Date.now();
        const expirationDate = utilNewExpirationDate();
        expect(expirationDate).toBeGreaterThan(now + 1000 * 60 * 4);
        expect(expirationDate).toBeLessThan(now + 1000 * 60 * 6);
      });
    });

    describe('parseQueryArgs', () => {
      it('should parse endpoint and listArgs correctly', () => {
        const args = ['endpoint', { param: 'value' }];
        const result = parseQueryArgs(args);
        expect(result).toEqual({ endpoint: 'endpoint', listArgs: { param: 'value' } });
      });

      it('should handle null endpoint', () => {
        const args = [null, { param: 'value' }];
        const result = parseQueryArgs(args);
        expect(result).toEqual({ endpoint: null, listArgs: { param: 'value' } });
      });

      it('should default listArgs to empty object if not provided', () => {
        const args = ['endpoint'];
        const result = parseQueryArgs(args);
        expect(result).toEqual({ endpoint: 'endpoint', listArgs: {} });
      });

      it('should handle missing arguments', () => {
        const result = parseQueryArgs([]);
        expect(result).toEqual({ endpoint: undefined, listArgs: {} });
      });
    });

    describe('createEndpoint', () => {
      it('should build endpoint with provided arguments', () => {
        const endpointTemplate = 'users/:userId/posts/:postId';
        const buildEndpoint = createEndpoint(endpointTemplate);
        const endpoint = buildEndpoint({ userId: '123', postId: '456' });
        expect(endpoint).toBe('users/123/posts/456');
      });

      it('should return null if arguments are missing', () => {
        const endpointTemplate = 'users/:userId/posts/:postId';
        const buildEndpoint = createEndpoint(endpointTemplate);
        const endpoint = buildEndpoint({ userId: '123' });
        expect(endpoint).toBeNull();
      });

      it('should return null if arguments are undefined', () => {
        const endpointTemplate = 'users/:userId/posts/:postId';
        const buildEndpoint = createEndpoint(endpointTemplate);
        const endpoint = buildEndpoint({ userId: '123', postId: undefined });
        expect(endpoint).toBeNull();
      });

      it('should return null if placeholders remain unresolved', () => {
        const endpointTemplate = 'users/:userId/posts/:postId';
        const buildEndpoint = createEndpoint(endpointTemplate);
        const endpoint = buildEndpoint({});
        expect(endpoint).toBeNull();
      });
    });
  });
});
