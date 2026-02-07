const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')

module.exports = {
    // 获取category列表（分页）
    category: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, name, icon, parent_id, sort_order, status, create_date, update_date FROM category LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM category';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            return await executePaginatedQuery(sql, countSql, values);
        } catch (error) {
            console.error('获取category列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取category - 使用 DataLoader 优化
    categoryGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询category:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.category.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的category不存在`);
            }
            
            return result;
        } catch (error) {
            console.error('获取category失败:', error.message);
            throw error;
        }
    },

    // 批量获取category - 新增方法，展示 DataLoader 批量能力
    categoryBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询category:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.category.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            return results.filter(result => result !== null && !(result instanceof Error));
        } catch (error) {
            console.error('批量获取category失败:', error.message);
            throw error;
        }
    },

    // 搜索category（分页）- 使用 DataLoader 优化搜索
    categorySearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            // 如果有名称搜索，尝试使用 DataLoader 搜索缓存
            if (data.name && data.name.trim() !== '') {
                console.log('🚀 使用 DataLoader 搜索category:', { searchTerm: data.name.trim() });
                
                try {
                    // 使用 DataLoader 进行搜索（这里会缓存搜索结果）
                    const searchResults = await context.dataloaders.category.searchByName.load(data.name.trim());
                    
                    // 手动分页处理
                    const totalCounts = searchResults.length;
                    const startIndex = validPage * validPageSize;
                    const endIndex = startIndex + validPageSize;
                    const items = searchResults.slice(startIndex, endIndex);
                    
                    return {
                        totalCounts,
                        items
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

            const sql = `SELECT id, name, icon, parent_id, sort_order, status, create_date, update_date FROM category WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM category WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索category（备用查询）:', { sql, values, countSql, countValues });
            
            return await executePaginatedQuery(sql, countSql, values, countValues);
        } catch (error) {
            console.error('搜索category失败:', error.message);
            throw error;
        }
    },

    // 添加category - 添加 DataLoader 缓存预加载
    categoryAdd: async ({ data }, context) => {
        try {
            if (!data.name) {
                throw new Error('分类名称是必填字段');
            }
            const validParent_id = validateInteger(data.parent_id, 'parent_id', { required: true });
            const validSort_order = validateInteger(data.sort_order, 'sort_order', { required: true });
            if (!data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'INSERT INTO category (name, icon, parent_id, sort_order, status) VALUES (?, ?, ?, ?, ?)';
            const values = [data.name, data.icon, validParent_id, validSort_order, data.status];
            
            console.log('添加category:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.category) {
                const newRecord = { id: insertId, name: data.name, icon: data.icon, parent_id: validParent_id, sort_order: validSort_order, status: data.status };
                context.dataloaders.category.prime(insertId, newRecord);
                console.log('🚀 新category已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加category失败:', error.message);
            throw error;
        }
    },

    // 批量添加category
    categoryBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    if (!data.name) {
                        throw new Error('分类名称是必填字段');
                    }
                    const validParent_id = validateInteger(data.parent_id, `第${index + 1}条数据的parent_id`, { required: true });
                    const validSort_order = validateInteger(data.sort_order, `第${index + 1}条数据的sort_order`, { required: true });
                    if (!data.status) {
                        throw new Error('状态是必填字段');
                    }
                    return { name: data.name, icon: data.icon, parent_id: validParent_id, sort_order: validSort_order, status: data.status };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO category (name, icon, parent_id, sort_order, status) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.name, data.icon, data.parent_id, data.sort_order, data.status]);
            
            console.log('批量添加category:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加category失败:', error.message);
            throw error;
        }
    },

    // 更新category - 添加 DataLoader 缓存清理
    categoryUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            if (data.name !== undefined && !data.name) {
                throw new Error('分类名称是必填字段');
            }
            let validParent_id = data.parent_id;
            if (data.parent_id !== undefined) {
                validParent_id = validateInteger(data.parent_id, 'parent_id', { required: true });
            }
            let validSort_order = data.sort_order;
            if (data.sort_order !== undefined) {
                validSort_order = validateInteger(data.sort_order, 'sort_order', { required: true });
            }
            if (data.status !== undefined && !data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'UPDATE category SET name = ?, icon = ?, parent_id = ?, sort_order = ?, status = ? WHERE id = ?';
            const values = [data.name, data.icon, validParent_id, validSort_order, data.status, validId];
            
            console.log('更新category:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的category不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.category) {
                context.dataloaders.category.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新category失败:', error.message);
            throw error;
        }
    },

    // 删除category - 添加 DataLoader 缓存清理
    categoryDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM category WHERE id = ?';
            const values = [validId];
            
            console.log('删除category:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的category不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.category) {
                context.dataloaders.category.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除category失败:', error.message);
            throw error;
        }
    },

    // 批量删除category - 添加 DataLoader 缓存清理
    categoryBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM category WHERE id IN (${placeholders})`;
            
            console.log('批量删除category:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的category');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.category) {
                validIds.forEach(id => {
                    context.dataloaders.category.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除category失败:', error.message);
            throw error;
        }
    }
}