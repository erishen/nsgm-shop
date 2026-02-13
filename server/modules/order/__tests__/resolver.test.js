/**
 * Order Resolver 测试
 */

const { order, orderGet, orderSearch, orderAdd, orderUpdate, orderDelete } = require('../resolver')

// Mock 数据库操作
jest.mock('../../../utils/common', () => ({
  executeQuery: jest.fn(),
  executePaginatedQuery: jest.fn()
}))

const { executeQuery, executePaginatedQuery } = require('../../../utils/common')

// Mock 验证函数
jest.mock('../../../utils/validation', () => ({
  validateInteger: jest.fn((val, name) => val),
  validateId: jest.fn((val) => val),
  validatePagination: jest.fn((page, pageSize) => ({ page, pageSize }))
}))

const { validateInteger, validateId, validatePagination } = require('../../../utils/validation')

// Mock 日期格式化
jest.mock('../../../utils/date-formatter', () => ({
  formatResultDates: jest.fn((data) => data)
}))

const { formatResultDates } = require('../../../utils/date-formatter')

describe('Order Resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('order - 获取订单列表', () => {
    it('应该成功获取所有订单列表', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, order_no: 'ORD001', total_amount: 299.99, status: 'pending' },
        { id: 2, user_id: 1, order_no: 'ORD002', total_amount: 599.99, status: 'paid' }
      ]
      const mockResult = {
        totalCounts: 2,
        items: mockOrders
      }

      executePaginatedQuery.mockResolvedValue(mockResult)
      formatResultDates.mockReturnValue(mockOrders)

      const result = await order({ page: 0, pageSize: 10 })

      expect(validatePagination).toHaveBeenCalledWith(0, 10)
      expect(executePaginatedQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.stringContaining('SELECT COUNT'),
        [10, 0],
        []
      )
      expect(formatResultDates).toHaveBeenCalledWith(mockOrders)
      expect(result).toEqual(mockResult)
    })

    it('应该支持按 user_id 过滤订单', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, order_no: 'ORD001', total_amount: 299.99, status: 'pending' }
      ]
      const mockResult = {
        totalCounts: 1,
        items: mockOrders
      }

      executePaginatedQuery.mockResolvedValue(mockResult)
      formatResultDates.mockReturnValue(mockOrders)
      validateInteger.mockReturnValue(1)

      const result = await order({ page: 0, pageSize: 10, user_id: 1 })

      expect(executePaginatedQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = ?'),
        expect.stringContaining('WHERE user_id = ?'),
        [1, 10, 0],
        [1]
      )
      expect(result).toEqual(mockResult)
    })

    it('应该正确计算总数', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, order_no: 'ORD001', total_amount: 299.99, status: 'pending' }
      ]
      const mockResult = {
        totalCounts: 1,
        items: mockOrders
      }

      executePaginatedQuery.mockResolvedValue(mockResult)
      formatResultDates.mockReturnValue(mockOrders)
      validateInteger.mockReturnValue(1)

      const result = await order({ page: 0, pageSize: 10, user_id: 1 })

      expect(result.totalCounts).toBe(1)
      expect(result.items).toHaveLength(1)
    })
  })

  describe('orderGet - 根据ID获取订单', () => {
    it('应该成功获取订单详情', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        order_no: 'ORD001',
        total_amount: 299.99,
        pay_amount: 299.99,
        status: 'pending',
        pay_status: 'pending',
        receiver_name: '张三',
        receiver_phone: '13800138000',
        receiver_address: '北京市朝阳区'
      }
      const mockContext = {
        dataloaders: {
          order: {
            byId: {
              load: jest.fn().mockResolvedValue(mockOrder)
            }
          }
        }
      }

      validateId.mockReturnValue(1)
      formatResultDates.mockReturnValue(mockOrder)

      const result = await orderGet({ id: 1 }, mockContext)

      expect(validateId).toHaveBeenCalledWith(1)
      expect(mockContext.dataloaders.order.byId.load).toHaveBeenCalledWith(1)
      expect(formatResultDates).toHaveBeenCalledWith(mockOrder)
      expect(result).toEqual(mockOrder)
    })

    it('订单不存在时应该抛出错误', async () => {
      const mockContext = {
        dataloaders: {
          order: {
            byId: {
              load: jest.fn().mockResolvedValue(null)
            }
          }
        }
      }

      validateId.mockReturnValue(1)

      await expect(orderGet({ id: 1 }, mockContext)).rejects.toThrow('ID为 1 的order不存在')
    })
  })

  describe('orderSearch - 搜索订单', () => {
    it('应该根据订单号搜索订单', async () => {
      const mockOrders = [
        { id: 1, user_id: 1, order_no: 'ORD202502110001', total_amount: 299.99, status: 'pending' }
      ]
      const mockResult = {
        totalCounts: 1,
        items: mockOrders
      }

      executePaginatedQuery.mockResolvedValue(mockResult)
      formatResultDates.mockReturnValue(mockOrders)

      const result = await orderSearch({
        page: 0,
        pageSize: 10,
        data: { order_no: 'ORD001' }
      })

      expect(executePaginatedQuery).toHaveBeenCalledWith(
        expect.stringContaining('order_no LIKE ?'),
        expect.stringContaining('order_no LIKE ?'),
        expect.arrayContaining(['%ORD001%', 10, 0]),
        ['%ORD001%']
      )
      expect(result).toEqual(mockResult)
    })
  })

  describe('orderAdd - 添加订单', () => {
    it('应该成功添加订单', async () => {
      const mockInsertId = 123
      executeQuery.mockResolvedValue({ insertId: mockInsertId })
      validateInteger.mockReturnValue(1)

      const result = await orderAdd({
        data: {
          order_no: 'ORD202502110001',
          user_id: 1,
          total_amount: 299.99,
          pay_amount: 299.99,
          status: 'pending',
          pay_status: 'pending',
          receiver_name: '张三',
          receiver_phone: '13800138000',
          receiver_address: '北京市朝阳区'
        }
      })

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining([
          'ORD202502110001',
          1,
          299.99,
          '张三',
          '13800138000',
          '北京市朝阳区'
        ])
      )
      expect(result).toBe(mockInsertId)
    })

    it('缺少必填字段时应该抛出错误', async () => {
      await expect(
        orderAdd({ data: { user_id: 1, total_amount: 299.99 } })
      ).rejects.toThrow('订单编号是必填字段')
    })
  })

  describe('orderUpdate - 更新订单', () => {
    it('应该成功更新订单状态', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 1 })
      validateId.mockReturnValue(1)

      const result = await orderUpdate({
        id: 1,
        data: { status: 'paid', pay_status: 'paid' }
      })

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(['paid', 'paid', 1])
      )
      expect(result).toBe(true)
    })

    it('订单不存在时应该抛出错误', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 0 })
      validateId.mockReturnValue(1)

      await expect(
        orderUpdate({ id: 1, data: { status: 'paid' } })
      ).rejects.toThrow('ID为 1 的order不存在')
    })
  })

  describe('orderDelete - 删除订单', () => {
    it('应该成功删除订单', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 1 })
      validateId.mockReturnValue(1)

      const result = await orderDelete({ id: 1 })

      expect(executeQuery).toHaveBeenCalledWith(
        'DELETE FROM `order` WHERE id = ?',
        [1]
      )
      expect(result).toBe(true)
    })

    it('订单不存在时应该抛出错误', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 0 })
      validateId.mockReturnValue(1)

      await expect(orderDelete({ id: 1 })).rejects.toThrow('ID为 1 的order不存在')
    })
  })
})
