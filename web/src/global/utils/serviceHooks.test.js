import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import {
  useGetResourceById,
  useGetResource,
  useGetResourceList,
  useMutateResource,
} from './serviceHooks';

// Mock dependencies
import * as customHooks from '../../global/utils/customHooks';

vi.mock('../../global/utils/customHooks', () => ({
  useIsFocused: vi.fn().mockReturnValue(true),
}));

// Mock store structure
const fromStoreMock = {
  byId: {
    '1': { id: '1', name: 'Resource 1' },
    '2': { id: '2', name: 'Resource 2' },
  },
  singleQueries: {
    '1': { id: '1', status: 'fulfilled', receivedAt: Date.now(), expirationDate: Date.now() + 300000 },
  },
  listQueries: {
    'logged-in?page=1&per=10': {
      ids: ['1', '2'],
      status: 'fulfilled',
      receivedAt: Date.now(),
      expirationDate: Date.now() + 300000,
      totalPages: 1,
      totalCount: 2,
    },
  },
};

// Tests for useGetResourceById
describe('useGetResourceById', () => {
  let sendFetchByIdMock;
  let sendInvalidateSingleMock;

  beforeEach(() => {
    sendFetchByIdMock = vi.fn();
    sendInvalidateSingleMock = vi.fn();
    // Reset the focus state for each test case
    customHooks.useIsFocused.mockReturnValue(true);
  });

  it('should fetch resource by id when mounted', async () => {
    const { result } = renderHook(() =>
      useGetResourceById({
        id: '1',
        fromStore: fromStoreMock,
        sendFetchById: sendFetchByIdMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
      })
    );

    await waitFor(() => {
      expect(sendFetchByIdMock).toHaveBeenCalledWith('1');
    });
  });

  it('should not fetch resource if id is undefined', async () => {
    renderHook(() =>
      useGetResourceById({
        id: undefined,
        fromStore: fromStoreMock,
        sendFetchById: sendFetchByIdMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
      })
    );
    await waitFor(() => {
      expect(sendFetchByIdMock).not.toHaveBeenCalled();
    })
  });

  it('should not fetch resource if window is not focused', async () => {
    // Set focus to false for this test
    customHooks.useIsFocused.mockReturnValue(false);

    renderHook(() =>
      useGetResourceById({
        id: '1',
        fromStore: fromStoreMock,
        sendFetchById: sendFetchByIdMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
      })
    );
    await waitFor(() => {
      expect(sendFetchByIdMock).not.toHaveBeenCalled();
    })
  });

  it('should invalidate and refetch resource', async () => {
    const { result } = renderHook(() =>
      useGetResourceById({
        id: '1',
        fromStore: fromStoreMock,
        sendFetchById: sendFetchByIdMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
      })
    );

    result.current.invalidate();
    result.current.refetch();
    await waitFor(() => {
      expect(sendInvalidateSingleMock).toHaveBeenCalledWith('1');
      expect(sendFetchByIdMock).toHaveBeenCalledWith('1');
    })
  });
});

// Tests for useGetResource
describe('useGetResource', () => {
  let sendFetchSingleMock = vi.fn();
  let sendInvalidateSingleMock = vi.fn();
  const listArgsMock = { _user: 'userId' };
  beforeEach(() => {
    sendFetchSingleMock = vi.fn();
    sendInvalidateSingleMock = vi.fn();
    // Reset the focus state for each test case
    customHooks.useIsFocused.mockReturnValue(true);
  });

  it('should not fetch resource if listArgs are incomplete', async () => {
    renderHook(() =>
      useGetResource({
        listArgs: { _user: undefined },
        fromStore: fromStoreMock,
        sendFetchSingle: sendFetchSingleMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
        endpoint: 'logged-in',
      })
    );
    await waitFor(() => {
      expect(sendFetchSingleMock).not.toHaveBeenCalled();
    })
  });

  it('should fetch resource with valid list args', async () => {
    renderHook(() =>
      useGetResource({
        listArgs: listArgsMock,
        fromStore: fromStoreMock,
        sendFetchSingle: sendFetchSingleMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
        endpoint: 'logged-in',
      })
    );

    await waitFor(() => {
      expect(sendFetchSingleMock).toHaveBeenCalled();
    });
  });

  it('should invalidate and refetch resource', async () => {
    const { result } = renderHook(() =>
      useGetResource({
        listArgs: listArgsMock,
        fromStore: fromStoreMock,
        sendFetchSingle: sendFetchSingleMock,
        sendInvalidateSingle: sendInvalidateSingleMock,
        endpoint: 'logged-in',
      })
    );

    result.current.invalidate();
    expect(sendInvalidateSingleMock).toHaveBeenCalled();

    result.current.refetch();
    expect(sendFetchSingleMock).toHaveBeenCalled();
  });
});

// Tests for useGetResourceList
describe('useGetResourceList', () => {
  let sendFetchListMock = vi.fn();
  let sendInvalidateListMock = vi.fn();
  const listArgsMock = { page: 1, per: 10 };

  beforeEach(() => {
    sendFetchListMock = vi.fn();
    sendInvalidateListMock = vi.fn();
  });

  it('should not fetch resource list if listArgs are incomplete', async () => {
    const { result } = renderHook(() =>
      useGetResourceList({
        listArgs: { keyNotReady: undefined, keyReady: 'example' },
        fromStore: fromStoreMock,
        sendFetchList: sendFetchListMock,
        sendInvalidateList: sendInvalidateListMock,
        endpoint: 'logged-in',
      })
    );

    await waitFor(() => {
      expect(sendFetchListMock).not.toHaveBeenCalled();
    })
  });

  it('should fetch resource list with valid list args', async () => {
    renderHook(() =>
      useGetResourceList({
        listArgs: listArgsMock,
        fromStore: fromStoreMock,
        sendFetchList: sendFetchListMock,
        sendInvalidateList: sendInvalidateListMock,
        endpoint: 'logged-in',
      })
    );

    await waitFor(() => {
      expect(sendFetchListMock).toHaveBeenCalled();
    });
  });

  it('should invalidate and refetch resource list', async () => {
    const { result } = renderHook(() =>
      useGetResourceList({
        listArgs: listArgsMock,
        fromStore: fromStoreMock,
        sendFetchList: sendFetchListMock,
        sendInvalidateList: sendInvalidateListMock,
        endpoint: 'logged-in',
      })
    );
    result.current.invalidate();
    expect(sendInvalidateListMock).toHaveBeenCalled();

    result.current.refetch();
    expect(sendFetchListMock).toHaveBeenCalled();
  });
});

// Tests for useMutateResource
describe('useMutateResource', () => {
  let sendMutationMock;
  let resourceQueryMock;
  let initialStateMock;
  let onResponseMock;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { });
    // sendMutationMock = vi.fn();
    // need to return a promise so that the hook can wait for the response
    sendMutationMock = async (newData) => vi.fn().mockResolvedValue({ payload: newData, error: null });
    // these mock our store values that the hook uses
    resourceQueryMock = {
      data: { _id: '1', name: 'Resource 1' },
      previousVersion: { _id: '123', name: 'Previous version' },
    };
    // this is the initial state of the form that we pass in from the component, should override the resourceQuery data in the form state
    initialStateMock = { name: 'Initial State' };
    onResponseMock = vi.fn();
  });

  it('should handle form state changes', async () => {
    const { result } = renderHook(() =>
      useMutateResource({
        resourceQuery: resourceQueryMock,
        sendMutation: sendMutationMock,
        initialState: initialStateMock,
        onResponse: onResponseMock,
      })
    );
    // verify the initial state
    expect(result.current.data.name).toBe(initialStateMock.name);
    result.current.handleChange({ target: { name: 'name', value: 'New Resource name' } });
    // verify the form state was updated
    expect(result.current.data.name).toBe('New Resource name');
  });

  it('should handle form change and submission with success', async () => {
    // set up the values we will use to test the form submission
    const testUpdateObj = { _id: '1', name: 'Updated Resource' };
    // mock the sendMutation function to return the updated resource (like a successful update would);
    const sendMutationMock = vi.fn((updatedFormState) => Promise.resolve({ payload: updatedFormState, error: null }));
    const { result } = renderHook(() =>
      useMutateResource({
        resourceQuery: resourceQueryMock,
        sendMutation: sendMutationMock, // the hook will call this function when the form is submitted and handle the response
        initialState: initialStateMock,
        onResponse: onResponseMock,
      })
    );
    // verify the initial state
    expect(result.current.data.name).toBe(initialStateMock.name);
    // change the form state
    result.current.handleChange({ target: { name: 'name', value: testUpdateObj.name } });
    // verify the form state was updated
    expect(result.current.data.name).toBe(testUpdateObj.name);
    // submit the form
    result.current.handleSubmit({ preventDefault: () => { } });
    // verify the sendMutation function was called with the updated form state
    expect(sendMutationMock).toHaveBeenCalledWith(testUpdateObj);
    await waitFor(() => {
      // make sure the onResponse callback was called with the updated resource, this means the whole process was successful
      expect(onResponseMock).toHaveBeenCalledWith(testUpdateObj, undefined);
    })
  });

  it('should handle form submission with error', async () => {
    const sendMutationMock = vi.fn(() => Promise.resolve({ error: { message: 'An error occurred' } }));
    const { result } = renderHook(() =>
      useMutateResource({
        resourceQuery: resourceQueryMock,
        sendMutation: sendMutationMock,
        initialState: initialStateMock,
        onResponse: onResponseMock,
      })
    );

    result.current.handleSubmit({ preventDefault: () => { } });
    expect(sendMutationMock).toHaveBeenCalledWith({ _id: '1', name: 'Initial State' });
    await waitFor(() => {
      expect(result.current.data.name).toBe('Initial State');
      expect(onResponseMock).toHaveBeenCalledWith(undefined, 'An error occurred');
    })
  });

  it('should reset form state', async () => {
    const { result } = renderHook(() =>
      useMutateResource({
        resourceQuery: resourceQueryMock,
        sendMutation: sendMutationMock,
        initialState: initialStateMock,
        onResponse: onResponseMock,
      })
    );

    result.current.handleChange({ target: { name: 'name', value: 'New Resource' } });
    result.current.resetFormState();
    expect(result.current.data.name).toBe('Initial State');
  });

  it('should handle undo mutation', async () => {
    const sendMutationMock = vi.fn((newData) => Promise.resolve({ payload: newData }));
    const { result } = renderHook(() =>
      useMutateResource({
        resourceQuery: resourceQueryMock,
        sendMutation: sendMutationMock,
        initialState: initialStateMock,
        onResponse: onResponseMock,
      })
    );
    // undo the mutation
    result.current.handleUndoUpdate();
    expect(sendMutationMock).toHaveBeenCalledWith(resourceQueryMock.previousVersion);
    await waitFor(() => {
      // verify the form state was reset to the previous version
      expect(result.current.data.name).toBe(resourceQueryMock.previousVersion.name);
    })
  });
});