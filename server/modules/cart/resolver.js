const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')

module.exports = {
    // 获取cart列表（分页）
    cart: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM cart';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            return await executePaginatedQuery(sql, countSql, values);
        } catch (error) {
            console.error('获取cart列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取cart - 使用 DataLoader 优化
    cartGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询cart:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.cart.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的cart不存在`);
            }
            
            return result;
        } catch (error) {
            console.error('获取cart失败:', error.message);
            throw error;
        }
    },

    // 批量获取cart - 新增方法，展示 DataLoader 批量能力
    cartBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询cart:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.cart.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            return results.filter(result => result !== null && !(result instanceof Error));
        } catch (error) {
            console.error('批量获取cart失败:', error.message);
            throw error;
        }
    },

    // 搜索cart（分页）- 使用 DataLoader 优化搜索
    cartSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';


            const sql = `SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM cart WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索cart（备用查询）:', { sql, values, countSql, countValues });
            
            return await executePaginatedQuery(sql, countSql, values, countValues);
        } catch (error) {
            console.error('搜索cart失败:', error.message);
            throw error;
        }
    },

    // 添加cart - 添加 DataLoader 缓存预加载
    cartAdd: async ({ data }, context) => {
        try {
            const validUser_id = validateInteger(data.user_id, 'user_id', { required: true });
            const validProduct_id = validateInteger(data.product_id, 'product_id', { required: true });
            if (!data.product_name) {
                throw new Error('商品名称是必填字段');
            }
            if (!data.price) {
                throw new Error('单价是必填字段');
            }
            const validQuantity = validateInteger(data.quantity, 'quantity', { required: true });
            const validSelected = validateInteger(data.selected, 'selected', { required: true });
            
            const sql = 'INSERT INTO cart (user_id, product_id, product_name, product_image, price, quantity, selected) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [validUser_id, validProduct_id, data.product_name, data.product_image, data.price, validQuantity, validSelected];
            
            console.log('添加cart:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.cart) {
                const newRecord = { id: insertId, user_id: validUser_id, product_id: validProduct_id, product_name: data.product_name, product_image: data.product_image, price: data.price, quantity: validQuantity, selected: validSelected };
                context.dataloaders.cart.prime(insertId, newRecord);
                console.log('🚀 新cart已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加cart失败:', error.message);
            throw error;
        }
    },

    // 批量添加cart
    cartBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    const validUser_id = validateInteger(data.user_id, `第${index + 1}条数据的user_id`, { required: true });
                    const validProduct_id = validateInteger(data.product_id, `第${index + 1}条数据的product_id`, { required: true });
                    if (!data.product_name) {
                        throw new Error('商品名称是必填字段');
                    }
                    if (!data.price) {
                        throw new Error('单价是必填字段');
                    }
                    const validQuantity = validateInteger(data.quantity, `第${index + 1}条数据的quantity`, { required: true });
                    const validSelected = validateInteger(data.selected, `第${index + 1}条数据的selected`, { required: true });
                    return { user_id: validUser_id, product_id: validProduct_id, product_name: data.product_name, product_image: data.product_image, price: data.price, quantity: validQuantity, selected: validSelected };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO cart (user_id, product_id, product_name, product_image, price, quantity, selected) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.user_id, data.product_id, data.product_name, data.product_image, data.price, data.quantity, data.selected]);
            
            console.log('批量添加cart:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加cart失败:', error.message);
            throw error;
        }
    },

    // 更新cart - 添加 DataLoader 缓存清理
    cartUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            let validUser_id = data.user_id;
            if (data.user_id !== undefined) {
                validUser_id = validateInteger(data.user_id, 'user_id', { required: true });
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
            let validSelected = data.selected;
            if (data.selected !== undefined) {
                validSelected = validateInteger(data.selected, 'selected', { required: true });
            }
            
            const sql = 'UPDATE cart SET user_id = ?, product_id = ?, product_name = ?, product_image = ?, price = ?, quantity = ?, selected = ? WHERE id = ?';
            const values = [validUser_id, validProduct_id, data.product_name, data.product_image, data.price, validQuantity, validSelected, validId];
            
            console.log('更新cart:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的cart不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.cart) {
                context.dataloaders.cart.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新cart失败:', error.message);
            throw error;
        }
    },

    // 删除cart - 添加 DataLoader 缓存清理
    cartDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM cart WHERE id = ?';
            const values = [validId];
            
            console.log('删除cart:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的cart不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.cart) {
                context.dataloaders.cart.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除cart失败:', error.message);
            throw error;
        }
    },

    // 批量删除cart - 添加 DataLoader 缓存清理
    cartBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM cart WHERE id IN (${placeholders})`;
            
            console.log('批量删除cart:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的cart');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.cart) {
                validIds.forEach(id => {
                    context.dataloaders.cart.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除cart失败:', error.message);
            throw error;
        }
    }
}