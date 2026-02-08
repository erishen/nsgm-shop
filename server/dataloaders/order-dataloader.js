const DataLoader = require('dataloader');
const { executeQuery } = require('../utils/common');

/**
 * Order DataLoader
 * 针对 order 表的批量数据加载器，解决 N+1 查询问题
 */
class OrderDataLoader {
  // 按 ID 批量加载 order
  byId;
  
  // 按名称批量加载 order  
  byName;
  
  // 按名称模糊搜索 order
  searchByName;

  constructor() {
    // 按 ID 批量加载
    this.byId = new DataLoader(
      async (ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${ids.length} 个 order by ID`);
          
          const placeholders = ids.map(() => '?').join(',');
          const sql = `SELECT id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, pay_time, ship_time, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark, create_date, update_date FROM order WHERE id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...ids]);
          
          // 确保返回顺序与输入 keys 一致，未找到的返回 null
          return ids.map(id => 
            results.find((row) => row.id === id) || null
          );
        } catch (error) {
          console.error('DataLoader byId 批量加载失败:', error);
          throw error;
        }
      },
      {
        cache: true,
        maxBatchSize: 100,
        batchScheduleFn: callback => setTimeout(callback, 10), // 10ms 内的请求合并
      }
    );

    // 按名称批量加载
    this.byName = new DataLoader(
      async (names) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${names.length} 个 order by name`);
          
          const placeholders = names.map(() => '?').join(',');
          const sql = `SELECT id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, pay_time, ship_time, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark, create_date, update_date FROM order WHERE name IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...names]);
          
          // 确保返回顺序与输入 keys 一致
          return names.map(name => 
            results.find((row) => row.name === name) || null
          );
        } catch (error) {
          console.error('DataLoader byName 批量加载失败:', error);
          throw error;
        }
      },
      {
        cache: true,
        maxBatchSize: 50,
        batchScheduleFn: callback => setTimeout(callback, 10),
      }
    );

    // 按名称模糊搜索（返回数组）
    this.searchByName = new DataLoader(
      async (searchTerms) => {
        try {
          console.log(`🔍 DataLoader: 批量搜索 ${searchTerms.length} 个关键词`);
          
          // 对于搜索，我们需要为每个搜索词执行独立的查询
          const results = await Promise.all(
            searchTerms.map(async (term) => {
              const sql = 'SELECT id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, pay_time, ship_time, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark, create_date, update_date FROM order WHERE name LIKE ?';
              return executeQuery(sql, [`%${term}%`]);
            })
          );
          
          return results;
        } catch (error) {
          console.error('DataLoader searchByName 批量搜索失败:', error);
          throw error;
        }
      },
      {
        cache: true,
        maxBatchSize: 20, // 搜索请求较少，降低批量大小
        batchScheduleFn: callback => setTimeout(callback, 20), // 稍长的等待时间
      }
    );

    
    // 按 user_id 批量加载相关的 order
    this.byUserId = new DataLoader(
      async (user_ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${user_ids.length} 个 order by user_id`);
          
          const placeholders = user_ids.map(() => '?').join(',');
          const sql = `SELECT id, order_no, user_id, total_amount, pay_amount, status, pay_status, pay_type, pay_time, ship_time, express_company, express_no, receiver_name, receiver_phone, receiver_address, remark, create_date, update_date FROM order WHERE user_id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...user_ids]);
          
          // 按外键分组
          return user_ids.map(user_id => 
            results.filter((row) => row.user_id === user_id)
          );
        } catch (error) {
          console.error('DataLoader byUserId 批量加载失败:', error);
          throw error;
        }
      },
      {
        cache: true,
        maxBatchSize: 50,
        batchScheduleFn: callback => setTimeout(callback, 10),
      }
    );
  }

  /**
   * 清除所有缓存
   */
  clearAll() {
    this.byId.clearAll();
    this.byName.clearAll();
    this.searchByName.clearAll();
    console.log('🧹 Order DataLoader 缓存已清空');
  }

  /**
   * 清除特定 ID 的缓存
   */
  clearById(id) {
    this.byId.clear(id);
  }

  /**
   * 清除特定名称的缓存
   */
  clearByName(name) {
    this.byName.clear(name);
  }

  /**
   * 预加载数据到缓存
   */
  prime(id, data) {
    this.byId.prime(id, data);
    if (data && data.name) {
      this.byName.prime(data.name, data);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      byId: {
        cacheMap: this.byId.cacheMap?.size || 0,
        name: 'Order.byId'
      },
      byName: {
        cacheMap: this.byName.cacheMap?.size || 0,
        name: 'Order.byName'
      },
      searchByName: {
        cacheMap: this.searchByName.cacheMap?.size || 0,
        name: 'Order.searchByName'
      }
    };
  }
}

/**
 * 创建 Order DataLoader 实例
 */
function createOrderDataLoader() {
  return new OrderDataLoader();
}

module.exports = { OrderDataLoader, createOrderDataLoader };