const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')
const { formatResultDates } = require('../../utils/date-formatter')

module.exports = {
    // 获取user列表（分页）
    user: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, username, password, nickname, real_name, avatar, phone, email, status, create_date, update_date FROM user LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM user';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            const result = await executePaginatedQuery(sql, countSql, values);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('获取user列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取user - 使用 DataLoader 优化
    userGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询user:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.user.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的user不存在`);
            }
            
            return formatResultDates(result);
        } catch (error) {
            console.error('获取user失败:', error.message);
            throw error;
        }
    },

    // 批量获取user - 新增方法，展示 DataLoader 批量能力
    userBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询user:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.user.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            const filteredResults = results.filter(result => result !== null && !(result instanceof Error));
            return formatResultDates(filteredResults);
        } catch (error) {
            console.error('批量获取user失败:', error.message);
            throw error;
        }
    },

    // 搜索user（分页）- 使用 DataLoader 优化搜索
    userSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';
            if (data.username && data.username.trim() !== '') {
                whereSql += ' AND username LIKE ?';
                const usernamePattern = `%${data.username.trim()}%`;
                values.push(usernamePattern);
                countValues.push(usernamePattern);
            }

            if (data.nickname && data.nickname.trim() !== '') {
                whereSql += ' AND nickname LIKE ?';
                const nicknamePattern = `%${data.nickname.trim()}%`;
                values.push(nicknamePattern);
                countValues.push(nicknamePattern);
            }

            if (data.phone && data.phone.trim() !== '') {
                whereSql += ' AND phone LIKE ?';
                const phonePattern = `%${data.phone.trim()}%`;
                values.push(phonePattern);
                countValues.push(phonePattern);
            }

            const sql = `SELECT id, username, password, nickname, real_name, avatar, phone, email, status, create_date, update_date FROM user WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM user WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索user（备用查询）:', { sql, values, countSql, countValues });
            
            const result = await executePaginatedQuery(sql, countSql, values, countValues);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('搜索user失败:', error.message);
            throw error;
        }
    },

    // 添加user - 添加 DataLoader 缓存预加载
    userAdd: async ({ data }, context) => {
        try {
            if (!data.username) {
                throw new Error('用户名是必填字段');
            }
            if (!data.password) {
                throw new Error('密码是必填字段');
            }
            if (!data.nickname) {
                throw new Error('昵称是必填字段');
            }
            if (!data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'INSERT INTO user (username, password, nickname, real_name, avatar, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [data.username, data.password, data.nickname, data.real_name, data.avatar, data.phone, data.email, data.status];
            
            console.log('添加user:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.user) {
                const newRecord = { id: insertId, username: data.username, password: data.password, nickname: data.nickname, real_name: data.real_name, avatar: data.avatar, phone: data.phone, email: data.email, status: data.status };
                context.dataloaders.user.prime(insertId, newRecord);
                console.log('🚀 新user已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加user失败:', error.message);
            throw error;
        }
    },

    // 批量添加user
    userBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    if (!data.username) {
                        throw new Error('用户名是必填字段');
                    }
                    if (!data.password) {
                        throw new Error('密码是必填字段');
                    }
                    if (!data.nickname) {
                        throw new Error('昵称是必填字段');
                    }
                    if (!data.status) {
                        throw new Error('状态是必填字段');
                    }
                    return { username: data.username, password: data.password, nickname: data.nickname, real_name: data.real_name, avatar: data.avatar, phone: data.phone, email: data.email, status: data.status };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO user (username, password, nickname, real_name, avatar, phone, email, status) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.username, data.password, data.nickname, data.real_name, data.avatar, data.phone, data.email, data.status]);
            
            console.log('批量添加user:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加user失败:', error.message);
            throw error;
        }
    },

    // 更新user - 添加 DataLoader 缓存清理
    userUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            if (data.username !== undefined && !data.username) {
                throw new Error('用户名是必填字段');
            }
            if (data.password !== undefined && !data.password) {
                throw new Error('密码是必填字段');
            }
            if (data.nickname !== undefined && !data.nickname) {
                throw new Error('昵称是必填字段');
            }
            if (data.status !== undefined && !data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'UPDATE user SET username = ?, password = ?, nickname = ?, real_name = ?, avatar = ?, phone = ?, email = ?, status = ? WHERE id = ?';
            const values = [data.username, data.password, data.nickname, data.real_name, data.avatar, data.phone, data.email, data.status, validId];
            
            console.log('更新user:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的user不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.user) {
                context.dataloaders.user.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新user失败:', error.message);
            throw error;
        }
    },

    // 删除user - 添加 DataLoader 缓存清理
    userDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM user WHERE id = ?';
            const values = [validId];
            
            console.log('删除user:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的user不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.user) {
                context.dataloaders.user.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除user失败:', error.message);
            throw error;
        }
    },

    // 批量删除user - 添加 DataLoader 缓存清理
    userBatchDelete: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('批量删除的ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map((id, index) => {
                try {
                    return validateId(id, `第${index + 1}个ID`);
                } catch (error) {
                    throw new Error(`第 ${index + 1} 个ID验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validIds.map(() => '?').join(',');
            const sql = `DELETE FROM user WHERE id IN (${placeholders})`;
            
            console.log('批量删除user:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的user');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.user) {
                validIds.forEach(id => {
                    context.dataloaders.user.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除user失败:', error.message);
            throw error;
        }
    }
}