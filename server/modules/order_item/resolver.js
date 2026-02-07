const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')

module.exports = {
    // 获取order_item列表（分页）
    order_item: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, order_id, product_id, product_name, product_image, price, quantity, subtotal, create_date FROM order_item LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM order_item';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            return await executePaginatedQuery(sql, countSql, values);
        } catch (error) {
            console.error('获取order_item列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取order_item - 使用 DataLoader 优化
    order_itemGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询order_item:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.order_item.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的order_item不存在`);
            }
            
            return result;
        } catch (error) {
            console.error('获取order_item失败:', error.message);
            throw error;
        }
    },

    // 批量获取order_item - 新增方法，展示 DataLoader 批量能力
    order_itemBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询order_item:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.order_item.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            return results.filter(result => result !== null && !(result instanceof Error));
        } catch (error) {
            console.error('批量获取order_item失败:', error.message);
            throw error;
        }
    },

    // 搜索order_item（分页）- 使用 DataLoader 优化搜索
    order_itemSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';
            if (data.product_name && data.product_name.trim() !== '') {
                whereSql += ' AND product_name LIKE ?';
                const product_namePattern = `%${data.product_name.trim()}%`;
                values.push(product_namePattern);
                countValues.push(product_namePattern);
            }

            const sql = `SELECT id, order_id, product_id, product_name, product_image, price, quantity, subtotal, create_date FROM order_item WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM order_item WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索order_item（备用查询）:', { sql, values, countSql, countValues });
            
            return await executePaginatedQuery(sql, countSql, values, countValues);
        } catch (error) {
            console.error('搜索order_item失败:', error.message);
            throw error;
        }
    },

    // 添加order_item - 添加 DataLoader 缓存预加载
    order_itemAdd: async ({ data }, context) => {
        try {
            const validOrder_id = validateInteger(data.order_id, 'order_id', { required: true });
            const validProduct_id = validateInteger(data.product_id, 'product_id', { required: true });
            if (!data.product_name) {
                throw new Error('商品名称是必填字段');
            }
            if (!data.price) {
                throw new Error('单价是必填字段');
            }
            const validQuantity = validateInteger(data.quantity, 'quantity', { required: true });
            if (!data.subtotal) {
                throw new Error('小计是必填字段');
            }
            
            const sql = 'INSERT INTO order_item (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [validOrder_id, validProduct_id, data.product_name, data.product_image, data.price, validQuantity, data.subtotal];
            
            console.log('添加order_item:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.order_item) {
                const newRecord = { id: insertId, order_id: validOrder_id, product_id: validProduct_id, product_name: data.product_name, product_image: data.product_image, price: data.price, quantity: validQuantity, subtotal: data.subtotal };
                context.dataloaders.order_item.prime(insertId, newRecord);
                console.log('🚀 新order_item已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加order_item失败:', error.message);
            throw error;
        }
    },

    // 批量添加order_item
    order_itemBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    const validOrder_id = validateInteger(data.order_id, `第${index + 1}条数据的order_id`, { required: true });
                    const validProduct_id = validateInteger(data.product_id, `第${index + 1}条数据的product_id`, { required: true });
                    if (!data.product_name) {
                        throw new Error('商品名称是必填字段');
                    }
                    if (!data.price) {
                        throw new Error('单价是必填字段');
                    }
                    const validQuantity = validateInteger(data.quantity, `第${index + 1}条数据的quantity`, { required: true });
                    if (!data.subtotal) {
                        throw new Error('小计是必填字段');
                    }
                    return { order_id: validOrder_id, product_id: validProduct_id, product_name: data.product_name, product_image: data.product_image, price: data.price, quantity: validQuantity, subtotal: data.subtotal };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO order_item (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.order_id, data.product_id, data.product_name, data.product_image, data.price, data.quantity, data.subtotal]);
            
            console.log('批量添加order_item:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加order_item失败:', error.message);
            throw error;
        }
    },

    // 更新order_item - 添加 DataLoader 缓存清理
    order_itemUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            let validOrder_id = data.order_id;
            if (data.order_id !== undefined) {
                validOrder_id = validateInteger(data.order_id, 'order_id', { required: true });
            }
            let validProduct_id = data.product_id;
            if (data.product_id !== undefined) {
                validProduct_id = validateInteger(data.product_id, 'product_id', { required: true });
            }
            if (data.product_name !== undefined && !data.product_name) {
                throw new Error('商品名称是必填字段');
            }
            if (data.price !== undefined && !data.price) {
                throw new Error('单价是必填字段');
            }
            let validQuantity = data.quantity;
            if (data.quantity !== undefined) {
                validQuantity = validateInteger(data.quantity, 'quantity', { required: true });
            }
            if (data.subtotal !== undefined && !data.subtotal) {
                throw new Error('小计是必填字段');
            }
            
            const sql = 'UPDATE order_item SET order_id = ?, product_id = ?, product_name = ?, product_image = ?, price = ?, quantity = ?, subtotal = ? WHERE id = ?';
            const values = [validOrder_id, validProduct_id, data.product_name, data.product_image, data.price, validQuantity, data.subtotal, validId];
            
            console.log('更新order_item:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的order_item不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.order_item) {
                context.dataloaders.order_item.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新order_item失败:', error.message);
            throw error;
        }
    },

    // 删除order_item - 添加 DataLoader 缓存清理
    order_itemDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM order_item WHERE id = ?';
            const values = [validId];
            
            console.log('删除order_item:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的order_item不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.order_item) {
                context.dataloaders.order_item.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除order_item失败:', error.message);
            throw error;
        }
    },

    // 批量删除order_item - 添加 DataLoader 缓存清理
    order_itemBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM order_item WHERE id IN (${placeholders})`;
            
            console.log('批量删除order_item:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的order_item');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.order_item) {
                validIds.forEach(id => {
                    context.dataloaders.order_item.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除order_item失败:', error.message);
            throw error;
        }
    }
}