const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')
const { formatResultDates } = require('../../utils/date-formatter')

module.exports = {
    // 获取payment列表（分页）
    payment: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM payment';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            const result = await executePaginatedQuery(sql, countSql, values);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('获取payment列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取payment - 使用 DataLoader 优化
    paymentGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询payment:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.payment.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的payment不存在`);
            }
            
            return formatResultDates(result);
        } catch (error) {
            console.error('获取payment失败:', error.message);
            throw error;
        }
    },

    // 批量获取payment - 新增方法，展示 DataLoader 批量能力
    paymentBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询payment:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.payment.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            const filteredResults = results.filter(result => result !== null && !(result instanceof Error));
            return formatResultDates(filteredResults);
        } catch (error) {
            console.error('批量获取payment失败:', error.message);
            throw error;
        }
    },

    // 搜索payment（分页）- 使用 DataLoader 优化搜索
    paymentSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';
            if (data.order_no && data.order_no.trim() !== '') {
                whereSql += ' AND order_no LIKE ?';
                const order_noPattern = `%${data.order_no.trim()}%`;
                values.push(order_noPattern);
                countValues.push(order_noPattern);
            }

            if (data.transaction_id && data.transaction_id.trim() !== '') {
                whereSql += ' AND transaction_id LIKE ?';
                const transaction_idPattern = `%${data.transaction_id.trim()}%`;
                values.push(transaction_idPattern);
                countValues.push(transaction_idPattern);
            }

            const sql = `SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM payment WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索payment（备用查询）:', { sql, values, countSql, countValues });
            
            const result = await executePaginatedQuery(sql, countSql, values, countValues);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('搜索payment失败:', error.message);
            throw error;
        }
    },

    // 添加payment - 添加 DataLoader 缓存预加载
    paymentAdd: async ({ data }, context) => {
        try {
            const validOrder_id = validateInteger(data.order_id, 'order_id', { required: true });
            if (!data.order_no) {
                throw new Error('订单编号是必填字段');
            }
            if (!data.transaction_id) {
                throw new Error('第三方交易号是必填字段');
            }
            if (!data.pay_type) {
                throw new Error('支付方式是必填字段');
            }
            if (!data.amount) {
                throw new Error('支付金额是必填字段');
            }
            if (!data.status) {
                throw new Error('支付状态是必填字段');
            }
            
            const sql = 'INSERT INTO payment (order_id, order_no, transaction_id, pay_type, amount, status, remark) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [validOrder_id, data.order_no, data.transaction_id, data.pay_type, data.amount, data.status, data.remark];
            
            console.log('添加payment:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.payment) {
                const newRecord = { id: insertId, order_id: validOrder_id, order_no: data.order_no, transaction_id: data.transaction_id, pay_type: data.pay_type, amount: data.amount, status: data.status, remark: data.remark };
                context.dataloaders.payment.prime(insertId, newRecord);
                console.log('🚀 新payment已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加payment失败:', error.message);
            throw error;
        }
    },

    // 批量添加payment
    paymentBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    const validOrder_id = validateInteger(data.order_id, `第${index + 1}条数据的order_id`, { required: true });
                    if (!data.order_no) {
                        throw new Error('订单编号是必填字段');
                    }
                    if (!data.transaction_id) {
                        throw new Error('第三方交易号是必填字段');
                    }
                    if (!data.pay_type) {
                        throw new Error('支付方式是必填字段');
                    }
                    if (!data.amount) {
                        throw new Error('支付金额是必填字段');
                    }
                    if (!data.status) {
                        throw new Error('支付状态是必填字段');
                    }
                    return { order_id: validOrder_id, order_no: data.order_no, transaction_id: data.transaction_id, pay_type: data.pay_type, amount: data.amount, status: data.status, remark: data.remark };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO payment (order_id, order_no, transaction_id, pay_type, amount, status, remark) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.order_id, data.order_no, data.transaction_id, data.pay_type, data.amount, data.status, data.remark]);
            
            console.log('批量添加payment:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加payment失败:', error.message);
            throw error;
        }
    },

    // 更新payment - 添加 DataLoader 缓存清理
    paymentUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            let validOrder_id = data.order_id;
            if (data.order_id !== undefined) {
                validOrder_id = validateInteger(data.order_id, 'order_id', { required: true });
            }
            if (data.order_no !== undefined && !data.order_no) {
                throw new Error('订单编号是必填字段');
            }
            if (data.transaction_id !== undefined && !data.transaction_id) {
                throw new Error('第三方交易号是必填字段');
            }
            if (data.pay_type !== undefined && !data.pay_type) {
                throw new Error('支付方式是必填字段');
            }
            if (data.amount !== undefined && !data.amount) {
                throw new Error('支付金额是必填字段');
            }
            if (data.status !== undefined && !data.status) {
                throw new Error('支付状态是必填字段');
            }
            
            const sql = 'UPDATE payment SET order_id = ?, order_no = ?, transaction_id = ?, pay_type = ?, amount = ?, status = ?, remark = ? WHERE id = ?';
            const values = [validOrder_id, data.order_no, data.transaction_id, data.pay_type, data.amount, data.status, data.remark, validId];
            
            console.log('更新payment:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的payment不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.payment) {
                context.dataloaders.payment.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新payment失败:', error.message);
            throw error;
        }
    },

    // 删除payment - 添加 DataLoader 缓存清理
    paymentDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM payment WHERE id = ?';
            const values = [validId];
            
            console.log('删除payment:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的payment不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.payment) {
                context.dataloaders.payment.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除payment失败:', error.message);
            throw error;
        }
    },

    // 批量删除payment - 添加 DataLoader 缓存清理
    paymentBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM payment WHERE id IN (${placeholders})`;
            
            console.log('批量删除payment:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的payment');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.payment) {
                validIds.forEach(id => {
                    context.dataloaders.payment.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除payment失败:', error.message);
            throw error;
        }
    }
}