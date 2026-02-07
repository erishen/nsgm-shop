import DataLoader from 'dataloader';
import { executeQuery } from '../utils/common';

/**
 * Cart DataLoader
 * 针对 cart 表的批量数据加载器，解决 N+1 查询问题
 */
export class CartDataLoader {
  // 按 ID 批量加载 cart
  public readonly byId: DataLoader<number, any>;
  
  // 按名称批量加载 cart  
  public readonly byName: DataLoader<string, any>;
  
  // 按名称模糊搜索 cart
  public readonly searchByName: DataLoader<string, any[]>;

  constructor() {
    // 按 ID 批量加载
    this.byId = new DataLoader(
      async (ids: readonly number[]) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${ids.length} 个 cart by ID`);
          
          const placeholders = ids.map(() => '?').join(',');
          const sql = `SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart WHERE id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...ids]);
          
          // 确保返回顺序与输入 keys 一致，未找到的返回 null
          return ids.map(id => 
            results.find((row: any) => row.id === id) || null
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
      async (names: readonly string[]) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${names.length} 个 cart by name`);
          
          const placeholders = names.map(() => '?').join(',');
          const sql = `SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart WHERE name IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...names]);
          
          // 确保返回顺序与输入 keys 一致
          return names.map(name => 
            results.find((row: any) => row.name === name) || null
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
      async (searchTerms: readonly string[]) => {
        try {
          console.log(`🔍 DataLoader: 批量搜索 ${searchTerms.length} 个关键词`);
          
          // 对于搜索，我们需要为每个搜索词执行独立的查询
          const results = await Promise.all(
            searchTerms.map(async (term) => {
              const sql = 'SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart WHERE name LIKE ?';
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

    
    // 按 user_id 批量加载相关的 cart
    this.byUserId = new DataLoader(
      async (user_ids: readonly number[]) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${user_ids.length} 个 cart by user_id`);
          
          const placeholders = user_ids.map(() => '?').join(',');
          const sql = `SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart WHERE user_id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...user_ids]);
          
          // 按外键分组
          return user_ids.map(user_id => 
            results.filter((row: any) => row.user_id === user_id)
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

    // 按 product_id 批量加载相关的 cart
    this.byProductId = new DataLoader(
      async (product_ids: readonly number[]) => {
        try {
          console.log(`🔍 DataLoader: 批量加载 ${product_ids.length} 个 cart by product_id`);
          
          const placeholders = product_ids.map(() => '?').join(',');
          const sql = `SELECT id, user_id, product_id, product_name, product_image, price, quantity, selected, create_date, update_date FROM cart WHERE product_id IN (${placeholders})`;
          
          const results = await executeQuery(sql, [...product_ids]);
          
          // 按外键分组
          return product_ids.map(product_id => 
            results.filter((row: any) => row.product_id === product_id)
          );
        } catch (error) {
          console.error('DataLoader byProductId 批量加载失败:', error);
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
  clearAll(): void {
    this.byId.clearAll();
    this.byName.clearAll();
    this.searchByName.clearAll();
    console.log('🧹 Cart DataLoader 缓存已清空');
  }

  /**
   * 清除特定 ID 的缓存
   */
  clearById(id: number): void {
    this.byId.clear(id);
  }

  /**
   * 清除特定名称的缓存
   */
  clearByName(name: string): void {
    this.byName.clear(name);
  }

  /**
   * 预加载数据到缓存
   */
  prime(id: number, data: any): void {
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
        name: 'Cart.byId'
      },
      byName: {
        cacheMap: this.byName.cacheMap?.size || 0,
        name: 'Cart.byName'
      },
      searchByName: {
        cacheMap: this.searchByName.cacheMap?.size || 0,
        name: 'Cart.searchByName'
      }
    };
  }
}

/**
 * 创建 Cart DataLoader 实例
 */
export function createCartDataLoader(): CartDataLoader {
  return new CartDataLoader();
}