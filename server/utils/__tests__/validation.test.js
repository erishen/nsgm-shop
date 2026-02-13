/**
 * Validation 工具函数测试
 */

const {
  validateInteger,
  validateId,
  validatePagination
} = require('../validation')

describe('Validation 工具函数', () => {
  describe('validateInteger', () => {
    it('应该接受有效的整数', () => {
      expect(validateInteger(123)).toBe(123)
      expect(validateInteger(0)).toBe(0)
      expect(validateInteger(-100)).toBe(-100)
    })

    it('应该接受字符串形式的整数', () => {
      expect(validateInteger('123')).toBe(123)
      expect(validateInteger('456')).toBe(456)
    })
  })

  describe('validateId', () => {
    it('应该接受有效的正整数 ID', () => {
      expect(validateId(1)).toBe(1)
      expect(validateId(123)).toBe(123)
      expect(validateId(9999)).toBe(9999)
    })

    it('应该接受字符串形式的 ID', () => {
      expect(validateId('123')).toBe(123)
      expect(validateId('456')).toBe(456)
    })
  })

  describe('validatePagination', () => {
    it('应该接受有效的分页参数', () => {
      const result = validatePagination(0, 10)
      expect(result).toEqual({ page: 0, pageSize: 10 })
    })

    it('应该设置默认值', () => {
      const result = validatePagination()
      expect(result).toEqual({ page: 0, pageSize: 10 })
    })
  })
})
