// Jest Setup File
// 这里可以设置全局测试变量和 mock

// 例如：mock localStorage
if (typeof global.localStorage === 'undefined' || global.localStorage === null) {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
}
