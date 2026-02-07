const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')
const { formatResultDates } = require('../../utils/date-formatter')

module.exports = {
    // 获取banner列表（分页）
    banner: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, title, image_url, link_url, sort_order, status, create_date, update_date FROM banner LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM banner';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            const result = await executePaginatedQuery(sql, countSql, values);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('获取banner列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取banner - 使用 DataLoader 优化
    bannerGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询banner:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.banner.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的banner不存在`);
            }
            
            return formatResultDates(result);
        } catch (error) {
            console.error('获取banner失败:', error.message);
            throw error;
        }
    },

    // 批量获取banner - 新增方法，展示 DataLoader 批量能力
    bannerBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询banner:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.banner.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            const filteredResults = results.filter(result => result !== null && !(result instanceof Error));
            return formatResultDates(filteredResults);
        } catch (error) {
            console.error('批量获取banner失败:', error.message);
            throw error;
        }
    },

    // 搜索banner（分页）- 使用 DataLoader 优化搜索
    bannerSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';
            if (data.title && data.title.trim() !== '') {
                whereSql += ' AND title LIKE ?';
                const titlePattern = `%${data.title.trim()}%`;
                values.push(titlePattern);
                countValues.push(titlePattern);
            }

            const sql = `SELECT id, title, image_url, link_url, sort_order, status, create_date, update_date FROM banner WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM banner WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索banner（备用查询）:', { sql, values, countSql, countValues });
            
            const result = await executePaginatedQuery(sql, countSql, values, countValues);
            if (result && result.items) {
                result.items = formatResultDates(result.items);
            }
            return result;
        } catch (error) {
            console.error('搜索banner失败:', error.message);
            throw error;
        }
    },

    // 添加banner - 添加 DataLoader 缓存预加载
    bannerAdd: async ({ data }, context) => {
        try {
            if (!data.title) {
                throw new Error('标题是必填字段');
            }
            if (!data.image_url) {
                throw new Error('图片是必填字段');
            }
            const validSort_order = validateInteger(data.sort_order, 'sort_order', { required: true });
            if (!data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'INSERT INTO banner (title, image_url, link_url, sort_order, status) VALUES (?, ?, ?, ?, ?)';
            const values = [data.title, data.image_url, data.link_url, validSort_order, data.status];
            
            console.log('添加banner:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.banner) {
                const newRecord = { id: insertId, title: data.title, image_url: data.image_url, link_url: data.link_url, sort_order: validSort_order, status: data.status };
                context.dataloaders.banner.prime(insertId, newRecord);
                console.log('🚀 新banner已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加banner失败:', error.message);
            throw error;
        }
    },

    // 批量添加banner
    bannerBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    if (!data.title) {
                        throw new Error('标题是必填字段');
                    }
                    if (!data.image_url) {
                        throw new Error('图片是必填字段');
                    }
                    const validSort_order = validateInteger(data.sort_order, `第${index + 1}条数据的sort_order`, { required: true });
                    if (!data.status) {
                        throw new Error('状态是必填字段');
                    }
                    return { title: data.title, image_url: data.image_url, link_url: data.link_url, sort_order: validSort_order, status: data.status };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO banner (title, image_url, link_url, sort_order, status) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.title, data.image_url, data.link_url, data.sort_order, data.status]);
            
            console.log('批量添加banner:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加banner失败:', error.message);
            throw error;
        }
    },

    // 更新banner - 添加 DataLoader 缓存清理
    bannerUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            if (data.title !== undefined && !data.title) {
                throw new Error('标题是必填字段');
            }
            if (data.image_url !== undefined && !data.image_url) {
                throw new Error('图片是必填字段');
            }
            let validSort_order = data.sort_order;
            if (data.sort_order !== undefined) {
                validSort_order = validateInteger(data.sort_order, 'sort_order', { required: true });
            }
            if (data.status !== undefined && !data.status) {
                throw new Error('状态是必填字段');
            }
            
            const sql = 'UPDATE banner SET title = ?, image_url = ?, link_url = ?, sort_order = ?, status = ? WHERE id = ?';
            const values = [data.title, data.image_url, data.link_url, validSort_order, data.status, validId];
            
            console.log('更新banner:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的banner不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.banner) {
                context.dataloaders.banner.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新banner失败:', error.message);
            throw error;
        }
    },

    // 删除banner - 添加 DataLoader 缓存清理
    bannerDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM banner WHERE id = ?';
            const values = [validId];
            
            console.log('删除banner:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的banner不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.banner) {
                context.dataloaders.banner.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除banner失败:', error.message);
            throw error;
        }
    },

    // 批量删除banner - 添加 DataLoader 缓存清理
    bannerBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM banner WHERE id IN (${placeholders})`;
            
            console.log('批量删除banner:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的banner');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.banner) {
                validIds.forEach(id => {
                    context.dataloaders.banner.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除banner失败:', error.message);
            throw error;
        }
    }
}