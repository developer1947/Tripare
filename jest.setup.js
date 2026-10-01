const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage[key] = String(value);
  }),
  getItem: jest.fn(async (key: string) => {
    return mockStorage[key] !== undefined ? mockStorage[key] : null;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStorage[key];
  }),
  clear: jest.fn(async () => {
    for (const k of Object.keys(mockStorage)) {
      delete mockStorage[k];
    }
  }),
  getAllKeys: jest.fn(async () => {
    return Object.keys(mockStorage);
  }),
}));

// Clean mock for NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
  addEventListener: jest.fn(() => () => { }),
}));

beforeEach(() => {
  for (const k of Object.keys(mockStorage)) {
    delete mockStorage[k];
  }
});
