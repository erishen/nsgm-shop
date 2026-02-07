# 初始数据导入指南

## 概述

本项目提供了完整的初始数据，包含用户、分类、商品、订单等，方便快速体验和测试系统功能。

## 数据内容

| 数据类型 | 数量 | 说明 |
|---------|------|------|
| 用户 | 5个 | 1个管理员 + 4个普通用户 |
| 分类 | 19个 | 5个一级分类 + 14个二级分类 |
| 商品 | 25个 | 涵盖数码、服装、食品、家居、美妆等品类 |
| 轮播图 | 5个 | 首页轮播广告图 |
| 地址 | 5个 | 用户收货地址 |
| 购物车 | 8条 | 用户购物车数据 |
| 订单 | 8个 | 各种状态的订单示例 |
| 订单项 | 10条 | 订单商品明细 |
| 支付记录 | 6条 | 支付成功记录 |

## 导入方法

### 方法一：使用 npm 命令（推荐）

```bash
cd /Users/erishen/Workspace/CNB/individular-invest/nsgm-shop

# 安装依赖（如果还没安装）
npm install

# 执行数据导入
npm run seed
```

### 方法二：使用 MySQL 命令行

#### 1. 确保 MySQL 运行中
```bash
# macOS
brew services start mysql

# 或检查状态
mysql.server status
```

#### 2. 创建数据库
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 3. 导入数据
```bash
cd /Users/erishen/Workspace/CNB/individular-invest/nsgm-shop

# 方法 A: 使用 mysql 命令
mysql -u root -p nsgm_shop < server/sql/seed_data.sql

# 方法 B: 进入 MySQL 后执行
mysql -u root -p
USE nsgm_shop;
source server/sql/seed_data.sql
```

### 方法三：使用数据库管理工具

使用 Navicat、DataGrip 等工具打开 `server/sql/seed_data.sql` 文件执行。

## 验证导入

```bash
mysql -u root -p -e "USE nsgm_shop; SHOW TABLES; SELECT COUNT(*) FROM product;"
```

## 用户账号

| 用户名 | 角色 | 说明 |
|--------|------|------|
| admin | 管理员 | 系统管理员账号 |
| user001 | 普通用户 | 快乐买家 - 张三 |
| user002 | 普通用户 | 购物达人 - 李四 |
| user003 | 普通用户 | 品质生活 - 王五 |
| user004 | 普通用户 | 数码控 - 赵六 |

**注意**: 用户密码需要先生成哈希值，使用以下命令：

```bash
npm run generate-password yourPassword
```

## 商品分类

### 一级分类
- 💻 数码电器
- 👕 服装鞋包
- 🍎 食品生鲜
- 🏠 家居日用
- 💄 美妆个护

### 热门商品

**数码类**:
- iPhone 15 Pro Max - ¥9999
- MacBook Pro 16寸 M3 Max - ¥24999
- AirPods Pro 2 - ¥1899

**服装类**:
- 纯棉休闲T恤 - ¥99
- 法式连衣裙 - ¥399
- Nike Air Force 1 - ¥749

**食品类**:
- 智利车厘子 JJ级 2kg - ¥299
- 有机燕麦片 1kg - ¥39.90

## 订单状态说明

系统包含以下订单状态示例：

1. **待支付** - 订单1: 刚创建的订单，等待支付
2. **已支付待发货** - 订单3、4: 已付款，等待商家发货
3. **已发货** - 订单1、2: 商家已发货，物流运输中
4. **已完成** - 订单6、7: 用户已确认收货
5. **已取消** - 订单8: 用户取消的订单

## 自定义数据

你可以修改 `server/sql/seed_data.sql` 文件来：

1. 添加更多用户
2. 添加新商品
3. 修改价格
4. 添加新分类
5. 自定义轮播图

修改后重新执行导入即可。

## 清除数据

如果需要清空所有数据重新导入：

```sql
-- 按依赖顺序删除（先删子表，再删父表）
DELETE FROM payment;
DELETE FROM order_item;
DELETE FROM `order`;
DELETE FROM cart;
DELETE FROM address;
DELETE FROM banner;
DELETE FROM product;
DELETE FROM category;
DELETE FROM user;

-- 重置自增ID
ALTER TABLE payment AUTO_INCREMENT = 1;
ALTER TABLE order_item AUTO_INCREMENT = 1;
ALTER TABLE `order` AUTO_INCREMENT = 1;
ALTER TABLE cart AUTO_INCREMENT = 1;
ALTER TABLE address AUTO_INCREMENT = 1;
ALTER TABLE banner AUTO_INCREMENT = 1;
ALTER TABLE product AUTO_INCREMENT = 1;
ALTER TABLE category AUTO_INCREMENT = 1;
ALTER TABLE user AUTO_INCREMENT = 1;
```

## 故障排除

### 问题1: mysql2 模块未找到
```bash
npm install mysql2 --save
```

### 问题2: 数据库连接失败
检查 `mysql.config.js` 配置是否正确，默认配置：
- host: 127.0.0.1
- port: 3306
- user: root
- password: password
- database: nsgm_shop

### 问题3: 权限不足
```sql
-- 在 MySQL 中执行
GRANT ALL PRIVILEGES ON nsgm_shop.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 问题4: 导入失败的其他原因
1. MySQL 是否已启动
2. 数据库 nsgm_shop 是否已创建
3. 数据库配置是否正确

你可以手动创建数据库：
```bash
mysql -u root -p -e "CREATE DATABASE nsgm_shop;"
```

## 图片资源

商品图片使用的是 Unsplash 免费图库的图片链接，需要联网才能正常显示。

如果需要使用本地图片，可以：
1. 将图片放入 `public/images/` 目录
2. 修改 SQL 中的图片路径
3. 重新导入数据
