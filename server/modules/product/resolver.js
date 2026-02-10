const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')
const { formatResultDates } = require('../../utils/date-formatter')

module.exports = {
    // 获取product列表（分页）
    product: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, name, description, price, original_price, category_id, stock, image_url, images, sales, status, create_date, update_date FROM product LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM product';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            const result = await executePaginatedQuery(sql, countSql, values);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('获取product列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取product - 使用 DataLoader 优化
    productGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询product:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.product.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的product不存在`);
            }
            
            return formatResultDates(result);
        } catch (error) {
            console.error('获取product失败:', error.message);
            throw error;
        }
    },

    // 批量获取product - 新增方法，展示 DataLoader 批量能力
    productBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询product:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.product.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            const filteredResults = results.filter(result => result !== null && !(result instanceof Error));
            return formatResultDates(filteredResults);
        } catch (error) {
            console.error('批量获取product失败:', error.message);
            throw error;
        }
    },

    // 搜索product（分页）- 使用 DataLoader 优化搜索
    productSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            // 如果有名称搜索，尝试使用 DataLoader 搜索缓存
            if (data.name && data.name.trim() !== '') {
                console.log('🚀 使用 DataLoader 搜索product:', { searchTerm: data.name.trim() });
                
                try {
                    // 使用 DataLoader 进行搜索（这里会缓存搜索结果）
                    const searchResults = await context.dataloaders.product.searchByName.load(data.name.trim());
                    
                    // 手动分页处理
                    const totalCounts = searchResults.length;
                    const startIndex = validPage * validPageSize;
                    const endIndex = startIndex + validPageSize;
                    const items = searchResults.slice(startIndex, endIndex);
                    
                    return {
                        totalCounts,
                        items: formatResultDates(items)
                    };
                } catch (dataLoaderError) {
                    console.warn('DataLoader 搜索失败，回退到直接查询:', dataLoaderError.message);
                    // 如果 DataLoader 失败，回退到原始查询方式
                }
            }
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';
            if (data.name && data.name.trim() !== '') {
                whereSql += ' AND name LIKE ?';
                const namePattern = `%${data.name.trim()}%`;
                values.push(namePattern);
                countValues.push(namePattern);
            }
            if (data.category_id !== undefined) {
                whereSql += ' AND category_id = ?';
                values.push(data.category_id);
                countValues.push(data.category_id);
            }

            const sql = `SELECT id, name, description, price, original_price, category_id, stock, image_url, images, sales, status, create_date, update_date FROM product WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM product WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索product（备用查询）:', { sql, values, countSql, countValues });
            
            const result = await executePaginatedQuery(sql, countSql, values, countValues);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('搜索product失败:', error.message);
            throw error;
        }
    },

    // 添加product - 添加 DataLoader 缓存预加载
    productAdd: async ({ data }, context) => {
        try {
            if (!data.name) {
                throw new Error('商品名称是必填字段');
            }
            if (!data.price) {
                throw new Error('售价是必填字段');
            }
            const validCategory_id = validateInteger(data.category_id, 'category_id', { required: true });
            const validStock = validateInteger(data.stock, 'stock', { required: true });
            const validSales = validateInteger(data.sales, 'sales', { required: true });
            if (!data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'INSERT INTO product (name, description, price, original_price, category_id, stock, image_url, images, sales, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [data.name, data.description, data.price, data.original_price, validCategory_id, validStock, data.image_url, data.images, validSales, data.status];
            
            console.log('添加product:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.product) {
                const newRecord = { id: insertId, name: data.name, description: data.description, price: data.price, original_price: data.original_price, category_id: validCategory_id, stock: validStock, image_url: data.image_url, images: data.images, sales: validSales, status: data.status };
                context.dataloaders.product.prime(insertId, newRecord);
                console.log('🚀 新product已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加product失败:', error.message);
            throw error;
        }
    },

    // 批量添加product
    productBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    if (!data.name) {
                        throw new Error('商品名称是必填字段');
                    }
                    if (!data.price) {
                        throw new Error('售价是必填字段');
                    }
                    const validCategory_id = validateInteger(data.category_id, `第${index + 1}条数据的category_id`, { required: true });
                    const validStock = validateInteger(data.stock, `第${index + 1}条数据的stock`, { required: true });
                    const validSales = validateInteger(data.sales, `第${index + 1}条数据的sales`, { required: true });
                    if (!data.status) {
                        throw new Error('状态是必填字段');
                    }
                    return { name: data.name, description: data.description, price: data.price, original_price: data.original_price, category_id: validCategory_id, stock: validStock, image_url: data.image_url, images: data.images, sales: validSales, status: data.status };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO product (name, description, price, original_price, category_id, stock, image_url, images, sales, status) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.name, data.description, data.price, data.original_price, data.category_id, data.stock, data.image_url, data.images, data.sales, data.status]);
            
            console.log('批量添加product:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加product失败:', error.message);
            throw error;
        }
    },

    // 更新product - 添加 DataLoader 缓存清理
    productUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            if (data.name !== undefined && !data.name) {
                throw new Error('商品名称是必填字段');
            }
            if (data.price !== undefined && !data.price) {
                throw new Error('售价是必填字段');
            }
            let validCategory_id = data.category_id;
            if (data.category_id !== undefined) {
                validCategory_id = validateInteger(data.category_id, 'category_id', { required: true });
            }
            let validStock = data.stock;
            if (data.stock !== undefined) {
                validStock = validateInteger(data.stock, 'stock', { required: true });
            }
            let validSales = data.sales;
            if (data.sales !== undefined) {
                validSales = validateInteger(data.sales, 'sales', { required: true });
            }
            if (data.status !== undefined && !data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'UPDATE product SET name = ?, description = ?, price = ?, original_price = ?, category_id = ?, stock = ?, image_url = ?, images = ?, sales = ?, status = ? WHERE id = ?';
            const values = [data.name, data.description, data.price, data.original_price, validCategory_id, validStock, data.image_url, data.images, validSales, data.status, validId];
            
            console.log('更新product:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的product不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.product) {
                context.dataloaders.product.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新product失败:', error.message);
            throw error;
        }
    },

    // 删除product - 添加 DataLoader 缓存清理
    productDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM product WHERE id = ?';
            const values = [validId];
            
            console.log('删除product:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的product不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.product) {
                context.dataloaders.product.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除product失败:', error.message);
            throw error;
        }
    },

    // 批量删除product - 添加 DataLoader 缓存清理
    productBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM product WHERE id IN (${placeholders})`;
            
            console.log('批量删除product:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的product');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.product) {
                validIds.forEach(id => {
                    context.dataloaders.product.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除product失败:', error.message);
            throw error;
        }
    }
}