// Jest Setup Globals
// 全局测试配置

// 暴露 testing library
const { TextEncoder, TextDecoder } = require('util')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// 暴露 fetch mock
global.fetch = jest.fn()
