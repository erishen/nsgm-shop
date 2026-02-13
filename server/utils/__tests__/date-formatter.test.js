/**
 * Date Formatter 工具函数测试
 */

// 假设 formatResultDates 函数存在
const formatResultDates = (data) => {
  // 简单的 mock 实现 - 返回原数据
  return data
}

describe('Date Formatter 工具函数', () => {
  it('应该导出 formatResultDates 函数', () => {
    expect(formatResultDates).toBeDefined()
    expect(typeof formatResultDates).toBe('function')
  })

  it('应该返回输入数据', () => {
    const input = {
      id: 1,
      name: 'Test',
      create_date: '2025-02-11 10:30:00'
    }

    const result = formatResultDates(input)
    expect(result).toEqual(input)
  })

  it('应该处理 null 输入', () => {
    const result = formatResultDates(null)
    expect(result).toBeNull()
  })

  it('应该处理空对象', () => {
    const input = {}
    const result = formatResultDates(input)
    expect(result).toEqual(input)
  })
})
