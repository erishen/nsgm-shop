/**
 * User Resolver 测试
 */

const { user, userGet, userSearch, userAdd, userUpdate, userDelete, login } = require('../resolver')
const bcrypt = require('bcrypt')

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

describe('User Resolver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('user - 获取用户列表', () => {
    it('应该成功获取用户列表', async () => {
      const mockUsers = [
        { id: 1, username: 'admin', nickname: '管理员', status: 'active' },
        { id: 2, username: 'user1', nickname: '用户1', status: 'active' }
      ]
      const mockResult = {
        totalCounts: 2,
        items: mockUsers
      }

      executePaginatedQuery.mockResolvedValue(mockResult)
      formatResultDates.mockReturnValue(mockUsers)

      const result = await user({ page: 0, pageSize: 10 })

      expect(validatePagination).toHaveBeenCalledWith(0, 10)
      expect(executePaginatedQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.any(String),
        [10, 0]
      )
      expect(formatResultDates).toHaveBeenCalledWith(mockUsers)
      expect(result).toEqual(mockResult)
    })
  })

  describe('userGet - 根据ID获取用户', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser = { id: 1, username: 'admin', nickname: '管理员', status: 'active' }
      const mockContext = {
        dataloaders: {
          user: {
            byId: {
              load: jest.fn().mockResolvedValue(mockUser)
            }
          }
        }
      }

      validateId.mockReturnValue(1)
      formatResultDates.mockReturnValue(mockUser)

      const result = await userGet({ id: 1 }, mockContext)

      expect(validateId).toHaveBeenCalledWith(1)
      expect(mockContext.dataloaders.user.byId.load).toHaveBeenCalledWith(1)
      expect(formatResultDates).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('用户不存在时应该抛出错误', async () => {
      const mockContext = {
        dataloaders: {
          user: {
            byId: {
              load: jest.fn().mockResolvedValue(null)
            }
          }
        }
      }

      validateId.mockReturnValue(1)

      await expect(userGet({ id: 1 }, mockContext)).rejects.toThrow('ID为 1 的user不存在')
    })
  })

  describe('userSearch - 搜索用户', () => {
    it('应该根据用户名搜索用户', async () => {
      const mockResult = {
        totalCounts: 1,
        items: [{ id: 1, username: 'admin', nickname: '管理员', status: 'active' }]
      }

      executePaginatedQuery.mockResolvedValue(mockResult)
      formatResultDates.mockReturnValue(mockResult)

      const result = await userSearch({
        page: 0,
        pageSize: 10,
        data: { username: 'admin' }
      })

      expect(executePaginatedQuery).toHaveBeenCalledWith(
        expect.stringContaining('username LIKE ?'),
        expect.any(String),
        expect.arrayContaining(['%admin%', 10, 0]),
        ['%admin%']
      )
      expect(result).toEqual(mockResult)
    })
  })

  describe('userAdd - 添加用户', () => {
    it('应该成功添加用户', async () => {
      const mockInsertId = 123
      executeQuery.mockResolvedValue({ insertId: mockInsertId })
      validateInteger.mockReturnValue(1)

      const result = await userAdd({
        data: {
          username: 'newuser',
          password: 'password123',
          nickname: '新用户',
          status: 'active'
        }
      })

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO'),
        expect.arrayContaining([
          'newuser',
          'password123',
          '新用户',
          'active'
        ])
      )
      expect(result).toBe(mockInsertId)
    })

    it('缺少必填字段时应该抛出错误', async () => {
      await expect(
        userAdd({ data: { nickname: '用户' } })
      ).rejects.toThrow('用户名是必填字段')
    })
  })

  describe('userUpdate - 更新用户', () => {
    it('应该成功更新用户信息', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 1 })
      validateId.mockReturnValue(1)
      validateInteger.mockReturnValue(1)

      const result = await userUpdate({
        id: 1,
        data: { nickname: '新昵称', email: 'test@example.com' }
      })

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.arrayContaining(['新昵称', 'test@example.com', 1])
      )
      expect(result).toBe(true)
    })

    it('用户不存在时应该抛出错误', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 0 })
      validateId.mockReturnValue(1)

      await expect(
        userUpdate({ id: 1, data: { nickname: '新昵称' } })
      ).rejects.toThrow('ID为 1 的user不存在')
    })
  })

  describe('userDelete - 删除用户', () => {
    it('应该成功删除用户', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 1 })
      validateId.mockReturnValue(1)

      const result = await userDelete({ id: 1 })

      expect(executeQuery).toHaveBeenCalledWith(
        'DELETE FROM user WHERE id = ?',
        [1]
      )
      expect(result).toBe(true)
    })

    it('用户不存在时应该抛出错误', async () => {
      executeQuery.mockResolvedValue({ affectedRows: 0 })
      validateId.mockReturnValue(1)

      await expect(userDelete({ id: 1 })).rejects.toThrow('ID为 1 的user不存在')
    })
  })

  describe('login - 用户登录', () => {
    it('应该成功登录并返回 token', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: '$2b$10$hashedpassword',
        status: 'active'
      }

      executeQuery.mockResolvedValue([mockUser])
      bcrypt.compare = jest.fn().mockResolvedValue(true)

      const result = await login({ username: 'admin', password: 'password123' })

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['admin']
      )
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password)
      expect(result).toMatch(/^user_\d+_\d+$/)
    })

    it('用户名不存在时应该抛出错误', async () => {
      executeQuery.mockResolvedValue([])

      await expect(
        login({ username: 'nonexistent', password: 'password123' })
      ).rejects.toThrow('用户名或密码错误')
    })

    it('密码错误时应该抛出错误', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: '$2b$10$hashedpassword',
        status: 'active'
      }

      executeQuery.mockResolvedValue([mockUser])
      bcrypt.compare = jest.fn().mockResolvedValue(false)

      await expect(
        login({ username: 'admin', password: 'wrongpassword' })
      ).rejects.toThrow('用户名或密码错误')
    })

    it('用户状态不活跃时应该抛出错误', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: '$2b$10$hashedpassword',
        status: 'inactive'
      }

      executeQuery.mockResolvedValue([mockUser])
      bcrypt.compare = jest.fn().mockResolvedValue(true)

      await expect(
        login({ username: 'admin', password: 'password123' })
      ).rejects.toThrow('账号已被禁用')
    })
  })
})
