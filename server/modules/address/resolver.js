const { executeQuery, executePaginatedQuery } = require('../../utils/common')
const { validateInteger, validatePagination, validateId } = require('../../utils/validation')

module.exports = {
    // 获取address列表（分页）
    address: async ({ page = 0, pageSize = 10 }) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            const sql = 'SELECT id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default, create_date, update_date FROM address LIMIT ? OFFSET ?';
            const countSql = 'SELECT COUNT(*) as counts FROM address';
            const values = [validPageSize, validPage * validPageSize];

            console.log('执行分页查询:', { sql, values, countSql });
            
            return await executePaginatedQuery(sql, countSql, values);
        } catch (error) {
            console.error('获取address列表失败:', error.message);
            throw error;
        }
    },

    // 根据ID获取address - 使用 DataLoader 优化
    addressGet: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            console.log('🚀 使用 DataLoader 根据ID查询address:', { id: validId });
            
            // 使用 DataLoader 批量加载，自动去重和缓存
            const result = await context.dataloaders.address.byId.load(validId);
            
            if (!result) {
                throw new Error(`ID为 ${validId} 的address不存在`);
            }
            
            return result;
        } catch (error) {
            console.error('获取address失败:', error.message);
            throw error;
        }
    },

    // 批量获取address - 新增方法，展示 DataLoader 批量能力
    addressBatchGet: async ({ ids }, context) => {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('ID列表不能为空');
            }
            
            // 验证所有ID
            const validIds = ids.map(id => validateId(id));
            
            console.log('🚀 使用 DataLoader 批量查询address:', { ids: validIds });
            
            // DataLoader 自动批量处理，一次查询获取所有数据
            const results = await context.dataloaders.address.byId.loadMany(validIds);
            
            // 过滤掉 null 结果（未找到的记录）
            return results.filter(result => result !== null && !(result instanceof Error));
        } catch (error) {
            console.error('批量获取address失败:', error.message);
            throw error;
        }
    },

    // 搜索address（分页）- 使用 DataLoader 优化搜索
    addressSearch: async ({ page = 0, pageSize = 10, data = {} }, context) => {
        try {
            const { page: validPage, pageSize: validPageSize } = validatePagination(page, pageSize);
            
            
            
            // 原始查询方式（作为备用）
            const values = [];
            const countValues = [];
            
            let whereSql = '';


            const sql = `SELECT id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default, create_date, update_date FROM address WHERE 1=1${whereSql} LIMIT ? OFFSET ?`;
            const countSql = `SELECT COUNT(*) as counts FROM address WHERE 1=1${whereSql}`;
            
            values.push(validPageSize, validPage * validPageSize);
            
            console.log('搜索address（备用查询）:', { sql, values, countSql, countValues });
            
            return await executePaginatedQuery(sql, countSql, values, countValues);
        } catch (error) {
            console.error('搜索address失败:', error.message);
            throw error;
        }
    },

    // 添加address - 添加 DataLoader 缓存预加载
    addressAdd: async ({ data }, context) => {
        try {
            const validUser_id = validateInteger(data.user_id, 'user_id', { required: true });
            if (!data.receiver_name) {
                throw new Error('收货人是必填字段');
            }
            if (!data.receiver_phone) {
                throw new Error('收货电话是必填字段');
            }
            if (!data.province) {
                throw new Error('省份是必填字段');
            }
            if (!data.city) {
                throw new Error('城市是必填字段');
            }
            if (!data.district) {
                throw new Error('区县是必填字段');
            }
            if (!data.detail_address) {
                throw new Error('详细地址是必填字段');
            }
            const validIs_default = validateInteger(data.is_default, 'is_default', { required: true });
            
            const sql = 'INSERT INTO address (user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [validUser_id, data.receiver_name, data.receiver_phone, data.province, data.city, data.district, data.detail_address, validIs_default];
            
            console.log('添加address:', { sql, values });
            
            const results = await executeQuery(sql, values);
            const insertId = results.insertId;
            
            // 预加载新数据到 DataLoader 缓存
            if (insertId && context?.dataloaders?.address) {
                const newRecord = { id: insertId, user_id: validUser_id, receiver_name: data.receiver_name, receiver_phone: data.receiver_phone, province: data.province, city: data.city, district: data.district, detail_address: data.detail_address, is_default: validIs_default };
                context.dataloaders.address.prime(insertId, newRecord);
                console.log('🚀 新address已预加载到 DataLoader 缓存:', newRecord);
            }
            
            return insertId;
        } catch (error) {
            console.error('添加address失败:', error.message);
            throw error;
        }
    },

    // 批量添加address
    addressBatchAdd: async ({ datas }) => {
        try {
            if (!Array.isArray(datas) || datas.length === 0) {
                throw new Error('批量添加数据不能为空');
            }
            
            // 验证所有数据并转换
            const validatedDatas = datas.map((data, index) => {
                try {
                    const validUser_id = validateInteger(data.user_id, `第${index + 1}条数据的user_id`, { required: true });
                    if (!data.receiver_name) {
                        throw new Error('收货人是必填字段');
                    }
                    if (!data.receiver_phone) {
                        throw new Error('收货电话是必填字段');
                    }
                    if (!data.province) {
                        throw new Error('省份是必填字段');
                    }
                    if (!data.city) {
                        throw new Error('城市是必填字段');
                    }
                    if (!data.district) {
                        throw new Error('区县是必填字段');
                    }
                    if (!data.detail_address) {
                        throw new Error('详细地址是必填字段');
                    }
                    const validIs_default = validateInteger(data.is_default, `第${index + 1}条数据的is_default`, { required: true });
                    return { user_id: validUser_id, receiver_name: data.receiver_name, receiver_phone: data.receiver_phone, province: data.province, city: data.city, district: data.district, detail_address: data.detail_address, is_default: validIs_default };
                } catch (error) {
                    throw new Error(`第 ${index + 1} 条数据验证失败: ${error.message}`);
                }
            });
            
            const placeholders = validatedDatas.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
            const sql = `INSERT INTO address (user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default) VALUES ${placeholders}`;
            const values = validatedDatas.flatMap(data => [data.user_id, data.receiver_name, data.receiver_phone, data.province, data.city, data.district, data.detail_address, data.is_default]);
            
            console.log('批量添加address:', { sql, values });
            
            const results = await executeQuery(sql, values);
            return results.insertId;
        } catch (error) {
            console.error('批量添加address失败:', error.message);
            throw error;
        }
    },

    // 更新address - 添加 DataLoader 缓存清理
    addressUpdate: async ({ id, data }, context) => {
        try {
            const validId = validateId(id);
            
            if (!data) {
                throw new Error('更新数据不能为空');
            }
            
            let validUser_id = data.user_id;
            if (data.user_id !== undefined) {
                validUser_id = validateInteger(data.user_id, 'user_id', { required: true });
            }
            if (data.receiver_name !== undefined && !data.receiver_name) {
                throw new Error('收货人是必填字段');
            }
            if (data.receiver_phone !== undefined && !data.receiver_phone) {
                throw new Error('收货电话是必填字段');
            }
            if (data.province !== undefined && !data.province) {
                throw new Error('省份是必填字段');
            }
            if (data.city !== undefined && !data.city) {
                throw new Error('城市是必填字段');
            }
            if (data.district !== undefined && !data.district) {
                throw new Error('区县是必填字段');
            }
            if (data.detail_address !== undefined && !data.detail_address) {
                throw new Error('详细地址是必填字段');
            }
            let validIs_default = data.is_default;
            if (data.is_default !== undefined) {
                validIs_default = validateInteger(data.is_default, 'is_default', { required: true });
            }
            
            const sql = 'UPDATE address SET user_id = ?, receiver_name = ?, receiver_phone = ?, province = ?, city = ?, district = ?, detail_address = ?, is_default = ? WHERE id = ?';
            const values = [validUser_id, data.receiver_name, data.receiver_phone, data.province, data.city, data.district, data.detail_address, validIs_default, validId];
            
            console.log('更新address:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的address不存在`);
            }
            
            // 清除 DataLoader 缓存，确保下次查询获取最新数据
            if (context?.dataloaders?.address) {
                context.dataloaders.address.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('更新address失败:', error.message);
            throw error;
        }
    },

    // 删除address - 添加 DataLoader 缓存清理
    addressDelete: async ({ id }, context) => {
        try {
            const validId = validateId(id);
            
            const sql = 'DELETE FROM address WHERE id = ?';
            const values = [validId];
            
            console.log('删除address:', { sql, values });
            
            const results = await executeQuery(sql, values);
            
            if (results.affectedRows === 0) {
                throw new Error(`ID为 ${validId} 的address不存在`);
            }
            
            // 清除 DataLoader 缓存
            if (context?.dataloaders?.address) {
                context.dataloaders.address.clearById(validId);
                console.log('🧹 已清除 DataLoader 缓存:', { id: validId });
            }
            
            return true;
        } catch (error) {
            console.error('删除address失败:', error.message);
            throw error;
        }
    },

    // 批量删除address - 添加 DataLoader 缓存清理
    addressBatchDelete: async ({ ids }, context) => {
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
            const sql = `DELETE FROM address WHERE id IN (${placeholders})`;
            
            console.log('批量删除address:', { sql, values: validIds });
            
            const results = await executeQuery(sql, validIds);
            
            if (results.affectedRows === 0) {
                throw new Error('没有找到要删除的address');
            }
            
            // 批量清除 DataLoader 缓存
            if (context?.dataloaders?.address) {
                validIds.forEach(id => {
                    context.dataloaders.address.clearById(id);
                });
                console.log('🧹 已批量清除 DataLoader 缓存:', { ids: validIds });
            }
            
            return true;
        } catch (error) {
            console.error('批量删除address失败:', error.message);
            throw error;
        }
    }
}