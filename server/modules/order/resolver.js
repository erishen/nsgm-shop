const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')
const { formatResultDates } = require('../../utils/date-formatter')

module.exports = {
    // 获取order列表（分页）
    order: async ({ page = 0, pageSize = 10, user_id }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);

            let whereSql = '';
            const values = [validPageSize, validPage * validPageSize];
            const countValues = [];

            if (user_id !== undefined && user_id !== null && user_id !== '') {
                const validUser_id = validateInteger(user_id, 'user_id');
                whereSql = ' WHERE user_id = ?';
                values.unshift(validUser_id);
                countValues.push(validUser_id);
            }

            const sql = `SELECT id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, pay_time, ship_time, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark, create_date, update_date FROM \`order\`${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM \`order\`${whereSql}`;

            console.log('执行分页查询:', { sql, values, countSql, countValues });

            const result = await executePaginatedQuery(sql, countSql, values, countValues);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('获取order列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取order - 使用 DataLoader 优化
    orderGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询order:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.order.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的order不存在`);
            }
            
            return formatResultDates(result);
        } catch (error) {
            console.error('获取order失败:', error.message);
            throw error;
        }
    },

    // 批量获取order - 新增方法，展示 DataLoader 批量能力
    orderBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询order:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.order.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            const filteredResults = results.filter(result => result !== null && !(result instanceof Error));
            return formatResultDates(filteredResults);
        } catch (error) {
            console.error('批量获取order失败:', error.message);
            throw error;
        }
    },

    // 搜索order（分页）- 使用 DataLoader 优化搜索
    orderSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
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

            const sql = `SELECT id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, pay_time, ship_time, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark, create_date, update_date FROM \`order\` WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM \`order\` WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索order（备用查询）:', { sql, values, countSql, countValues });
            
            const result = await executePaginatedQuery(sql, countSql, values, countValues);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('搜索order失败:', error.message);
            throw error;
        }
    },

    // 添加order - 添加 DataLoader 缓存预加载
    orderAdd: async ({ data }, context) => {
        try {
            if (!data.order_no) {
                throw new Error('订单编号是必填字段');
            }
            const validUser_id = validateInteger(data.user_id, 'user_id', { required: true });
            if (!data.total_amount) {
                throw new Error('订单总额是必填字段');
            }
            if (!data.pay_amount) {
                throw new Error('实付金额是必填字段');
            }
            if (!data.status) {
                throw new Error('订单状态是必填字段');
            }
            if (!data.pay_status) {
                throw new Error('支付状态是必填字段');
            }
            if (!data.receiver_name) {
                throw new Error('收货人是必填字段');
            }
            if (!data.receiver_phone) {
                throw new Error('收货电话是必填字段');
            }
            if (!data.receiver_address) {
                throw new Error('收货地址是必填字段');
            }
            
            const sql = 'INSERT INTO `order` (order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [data.order_no, validUser_id, data.total_amount, data.pay_amount, data.status, data.pay_status, data.pay_type, data.express_company, data.express_no, data.receiver_name, data.receiver_phone, data.receiver_address, data.remark];
            
            console.log('添加order:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.order) {
                const newRecord = { id: insertId, order_no: data.order_no, user_id: validUser_id, total_amount: data.total_amount, pay_amount: data.pay_amount, status: data.status, pay_status: data.pay_status, pay_type: data.pay_type, express_company: data.express_company, express_no: data.express_no, receiver_name: data.receiver_name, receiver_phone: data.receiver_phone, receiver_address: data.receiver_address, remark: data.remark };
                context.dataloaders.order.prime(insertId, newRecord);
                console.log('🚀 新order已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加order失败:', error.message);
            throw error;
        }
    },

    // 批量添加order
    orderBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    if (!data.order_no) {
                        throw new Error('订单编号是必填字段');
                    }
                    const validUser_id = validateInteger(data.user_id, `第${index + 1}条数据的user_id`, { required: true });
                    if (!data.total_amount) {
                        throw new Error('订单总额是必填字段');
                    }
                    if (!data.pay_amount) {
                        throw new Error('实付金额是必填字段');
                    }
                    if (!data.status) {
                        throw new Error('订单状态是必填字段');
                    }
                    if (!data.pay_status) {
                        throw new Error('支付状态是必填字段');
                    }
                    if (!data.receiver_name) {
                        throw new Error('收货人是必填字段');
                    }
                    if (!data.receiver_phone) {
                        throw new Error('收货电话是必填字段');
                    }
                    if (!data.receiver_address) {
                        throw new Error('收货地址是必填字段');
                    }
                    return { order_no: data.order_no, user_id: validUser_id, total_amount: data.total_amount, pay_amount: data.pay_amount, status: data.status, pay_status: data.pay_status, pay_type: data.pay_type, express_company: data.express_company, express_no: data.express_no, receiver_name: data.receiver_name, receiver_phone: data.receiver_phone, receiver_address: data.receiver_address, remark: data.remark };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO \`order\` (order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.order_no, data.user_id, data.total_amount, data.pay_amount, data.status, data.pay_status, data.pay_type, data.express_company, data.express_no, data.receiver_name, data.receiver_phone, data.receiver_address, data.remark]);
            
            console.log('批量添加order:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加order失败:', error.message);
            throw error;
        }
    },

    // 更新order - 添加 DataLoader 缓存清理
    orderUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            if (data.order_no !== undefined && !data.order_no) {
                throw new Error('订单编号是必填字段');
            }
            let validUser_id = data.user_id;
            if (data.user_id !== undefined) {
                validUser_id = validateInteger(data.user_id, 'user_id', { required: true });
            }
            if (data.total_amount !== undefined && !data.total_amount) {
                throw new Error('订单总额是必填字段');
            }
            if (data.pay_amount !== undefined && !data.pay_amount) {
                throw new Error('实付金额是必填字段');
            }
            if (data.status !== undefined && !data.status) {
                throw new Error('订单状态是必填字段');
            }
            if (data.pay_status !== undefined && !data.pay_status) {
                throw new Error('支付状态是必填字段');
            }
            if (data.receiver_name !== undefined && !data.receiver_name) {
                throw new Error('收货人是必填字段');
            }
            if (data.receiver_phone !== undefined && !data.receiver_phone) {
                throw new Error('收货电话是必填字段');
            }
            if (data.receiver_address !== undefined && !data.receiver_address) {
                throw new Error('收货地址是必填字段');
            }
            
            const sql = 'UPDATE `order` SET order_no = ?, user_id = ?, total_amount = ?, pay_amount = ?, status = ?, pay_status = ?, pay_type = ?, express_company = ?, express_no = ?, receiver_name = ?, receiver_phone = ?, receiver_address = ?, remark = ? WHERE id = ?';
            const values = [data.order_no, validUser_id, data.total_amount, data.pay_amount, data.status, data.pay_status, data.pay_type, data.express_company, data.express_no, data.receiver_name, data.receiver_phone, data.receiver_address, data.remark, validId];
            
            console.log('更新order:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的order不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.order) {
                context.dataloaders.order.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新order失败:', error.message);
            throw error;
        }
    },

    // 删除order - 添加 DataLoader 缓存清理
    orderDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM `order` WHERE id = ?';
            const values = [validId];
            
            console.log('删除order:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的order不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.order) {
                context.dataloaders.order.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除order失败:', error.message);
            throw error;
        }
    },

    // 批量删除order - 添加 DataLoader 缓存清理
    orderBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM \`order\` WHERE id IN (${placeholders})`;
            
            console.log('批量删除order:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的order');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.order) {
                validIds.forEach(id => {
                    context.dataloaders.order.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除order失败:', error.message);
            throw error;
        }
    }
}