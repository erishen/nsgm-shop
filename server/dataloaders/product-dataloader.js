const DataLoader = require('dataloader');
const { executeQuery } = require('../utils/common');

/**
 * 处理 product 行数据，将 JSON 字符串解析为对象
 */
function processProductRow(row) {
  if (!row) return row;
  
  // 处理 images 字段（JSON 字符串转数组）
  if (row.images && typeof row.images === 'string') {
    try {
      row.images = JSON.parse(row.images);
    } catch (e) {
      row.images = [];
    }
  }
  
  return row;
}

/**
 * Product DataLoader
 * 针对 product 表的批量数据加载器，解决 N+1 查询问题
 */
class ProductDataLoader {
  // 按 ID 批量加载 product
  byId;
  
  // 按名称批量加载 product  
  byName;
  
  // 按名称模糊搜索 product
  searchByName;

  constructor() {
    // 按 ID 批量加载
    this.byId = new DataLoader(
      async (ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${ids.length} 个 product by ID`);
          
          const placeholders = ids.map(() => '?').join(',');
          const sql = `SELECT id, name, description, price, original_price, category_id, stock, image_url, images, sales, status, create_date, update_date FROM product WHERE id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...ids]);
          
          // 确保返回顺序与输入 keys 一致，未找到的返回 null
          return ids.map(id => processProductRow(results.find((row) => row.id === id) || null));
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
          console.log(`🔍 DataLoader: 批量加载 ${names.length} 个 product by name`);
          
          const placeholders = names.map(() => '?').join(',');
          const sql = `SELECT id, name, description, price, original_price, category_id, stock, image_url, images, sales, status, create_date, update_date FROM product WHERE name IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...names]);
          
          // 确保返回顺序与输入 keys 一致
          return names.map(name => processProductRow(results.find((row) => row.name === name) || null));
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
              const sql = 'SELECT id, name, description, price, original_price, category_id, stock, image_url, images, sales, status, create_date, update_date FROM product WHERE name LIKE ?';
              const rows = await executeQuery(sql, [`%${term}%`]);
              return rows.map(processProductRow);
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

    
    // 按 category_id 批量加载相关的 product
    this.byCategoryId = new DataLoader(
      async (category_ids) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${category_ids.length} 个 product by category_id`);
          
          const placeholders = category_ids.map(() => '?').join(',');
          const sql = `SELECT id, name, description, price, original_price, category_id, stock, image_url, images, sales, status, create_date, update_date FROM product WHERE category_id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...category_ids]);
          
          // 按外键分组
          return category_ids.map(category_id => 
            results
              .filter((row) => row.category_id === category_id)
              .map(processProductRow)
          );
        } catch (error) {
          console.error('DataLoader byCategoryId 批量加载失败:', error);
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
    console.log('🧹 Product DataLoader 缓存已清空');
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
        name: 'Product.byId'
      },
      byName: {
        cacheMap: this.byName.cacheMap?.size || 0,
        name: 'Product.byName'
      },
      searchByName: {
        cacheMap: this.searchByName.cacheMap?.size || 0,
        name: 'Product.searchByName'
      }
    };
  }
}

/**
 * 创建 Product DataLoader 实例
 */
function createProductDataLoader() {
  return new ProductDataLoader();
}

module.exports = { ProductDataLoader, createProductDataLoader };