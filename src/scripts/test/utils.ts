export function mockGlobal(name: string, value: any) {
  global[name] = value;
}

export const portFactory = () => ({
  name: "aaa",
  postMessage: jest.fn(),
  disconnect: jest.fn(),
  onMessage: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  },
  onDisconnect: {
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
});
