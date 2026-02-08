const DataLoader = require('dataloader');
const { executeQuery } = require('../utils/common');

/**
 * Payment DataLoader
 * 针对 payment 表的批量数据加载器，解决 N+1 查询问题
 */
class PaymentDataLoader {
  // 按 ID 批量加载 payment
  byId;
  
  // 按名称批量加载 payment  
  byName;
  
  // 按名称模糊搜索 payment
  searchByName;

  constructor() {
    // 按 ID 批量加载
    this.byId = new DataLoader(
      async (ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${ids.length} 个 payment by ID`);
          
          const placeholders = ids.map(() => '?').join(',');
          const sql = `SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment WHERE id IN (${placeholders})`;
          
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
          console.log(`🔍 DataLoader: 批量加载 ${names.length} 个 payment by name`);
          
          const placeholders = names.map(() => '?').join(',');
          const sql = `SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment WHERE name IN (${placeholders})`;
          
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
              const sql = 'SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment WHERE name LIKE ?';
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

    
    // 按 order_id 批量加载相关的 payment
    this.byOrderId = new DataLoader(
      async (order_ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${order_ids.length} 个 payment by order_id`);
          
          const placeholders = order_ids.map(() => '?').join(',');
          const sql = `SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment WHERE order_id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...order_ids]);
          
          // 按外键分组
          return order_ids.map(order_id => 
            results.filter((row) => row.order_id === order_id)
          );
        } catch (error) {
          console.error('DataLoader byOrderId 批量加载失败:', error);
          throw error;
        }
      },
      {
        cache: true,
        maxBatchSize: 50,
        batchScheduleFn: callback => setTimeout(callback, 10),
      }
    );

    // 按 transaction_id 批量加载相关的 payment
    this.byTransactionId = new DataLoader(
      async (transaction_ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${transaction_ids.length} 个 payment by transaction_id`);
          
          const placeholders = transaction_ids.map(() => '?').join(',');
          const sql = `SELECT id, order_id, order_no, transaction_id, pay_type, amount, status, pay_time, callback_time, remark, create_date, update_date FROM payment WHERE transaction_id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...transaction_ids]);
          
          // 按外键分组
          return transaction_ids.map(transaction_id => 
            results.filter((row) => row.transaction_id === transaction_id)
          );
        } catch (error) {
          console.error('DataLoader byTransactionId 批量加载失败:', error);
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
    console.log('🧹 Payment DataLoader 缓存已清空');
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
        name: 'Payment.byId'
      },
      byName: {
        cacheMap: this.byName.cacheMap?.size || 0,
        name: 'Payment.byName'
      },
      searchByName: {
        cacheMap: this.searchByName.cacheMap?.size || 0,
        name: 'Payment.searchByName'
      }
    };
  }
}

/**
 * 创建 Payment DataLoader 实例
 */
function createPaymentDataLoader() {
  return new PaymentDataLoader();
}

module.exports = { PaymentDataLoader, createPaymentDataLoader };