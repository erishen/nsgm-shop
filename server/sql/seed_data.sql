-- ============================================
-- NSGM Shop 初始数据
-- 注意: 表结构已通过 npm run create-config 创建
-- 此文件只包含 INSERT 数据
-- ============================================

USE nsgm_shop;

-- ============================================
-- 1. 用户数据
-- ============================================
INSERT INTO `user` (`id`, `username`, `password`, `nickname`, `real_name`, `avatar`, `phone`, `email`, `status`, `create_date`, `update_date`) VALUES
(1, 'admin', '$2b$10$YourHashedPasswordHere', '管理员', '系统管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '13800138000', 'admin@nsgm-shop.com', 'active', NOW(), NOW()),
(2, 'user001', '$2b$10$YourHashedPasswordHere', '快乐买家', '张三', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001', '13800138001', 'user001@example.com', 'active', NOW(), NOW()),
(3, 'user002', '$2b$10$YourHashedPasswordHere', '购物达人', '李四', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002', '13800138002', 'user002@example.com', 'active', NOW(), NOW()),
(4, 'user003', '$2b$10$YourHashedPasswordHere', '品质生活', '王五', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003', '13800138003', 'user003@example.com', 'active', NOW(), NOW()),
(5, 'user004', '$2b$10$YourHashedPasswordHere', '数码控', '赵六', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user004', '13800138004', 'user004@example.com', 'active', NOW(), NOW());

-- ============================================
-- 2. 商品分类数据
-- ============================================
INSERT INTO `category` (`id`, `name`, `icon`, `parent_id`, `sort_order`, `status`, `create_date`, `update_date`) VALUES
-- 一级分类
(1, '数码电器', '💻', NULL, 1, 'active', NOW(), NOW()),
(2, '服装鞋包', '👕', NULL, 2, 'active', NOW(), NOW()),
(3, '食品生鲜', '🍎', NULL, 3, 'active', NOW(), NOW()),
(4, '家居日用', '🏠', NULL, 4, 'active', NOW(), NOW()),
(5, '美妆个护', '💄', NULL, 5, 'active', NOW(), NOW()),
-- 二级分类 - 数码电器
(6, '手机通讯', '📱', 1, 1, 'active', NOW(), NOW()),
(7, '电脑办公', '💻', 1, 2, 'active', NOW(), NOW()),
(8, '摄影摄像', '📷', 1, 3, 'active', NOW(), NOW()),
(9, '智能设备', '⌚', 1, 4, 'active', NOW(), NOW()),
-- 二级分类 - 服装鞋包
(10, '男装', '👔', 2, 1, 'active', NOW(), NOW()),
(11, '女装', '👗', 2, 2, 'active', NOW(), NOW()),
(12, '鞋靴', '👟', 2, 3, 'active', NOW(), NOW()),
(13, '箱包', '👜', 2, 4, 'active', NOW(), NOW()),
-- 二级分类 - 食品生鲜
(14, '新鲜水果', '🍎', 3, 1, 'active', NOW(), NOW()),
(15, '休闲零食', '🍪', 3, 2, 'active', NOW(), NOW()),
(16, '饮料冲调', '☕', 3, 3, 'active', NOW(), NOW()),
-- 二级分类 - 家居日用
(17, '厨房用品', '🍳', 4, 1, 'active', NOW(), NOW()),
(18, '床上用品', '🛏️', 4, 2, 'active', NOW(), NOW()),
(19, '收纳整理', '📦', 4, 3, 'active', NOW(), NOW());

-- ============================================
-- 3. 商品数据
-- ============================================
INSERT INTO `product` (`id`, `name`, `description`, `price`, `original_price`, `category_id`, `stock`, `image_url`, `images`, `sales`, `status`, `create_date`, `update_date`) VALUES
-- 手机通讯类
(1, 'iPhone 15 Pro Max', '苹果最新旗舰手机，A17 Pro芯片，钛金属边框，4800万像素主摄', 9999.00, 10999.00, 6, 100, 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500', '["https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500","https://images.unsplash.com/photo-1696446702188-3e9f9f0f9b0f?w=500"]', 568, 'active', NOW(), NOW()),
(2, 'Samsung Galaxy S24 Ultra', '三星旗舰，2亿像素，S Pen手写笔，AI功能强大', 9699.00, 10999.00, 6, 80, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', '["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500"]', 342, 'active', NOW(), NOW()),
(3, 'Xiaomi 14 Pro', '徕卡影像，骁龙8 Gen3，120W快充', 4999.00, 5499.00, 6, 200, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"]', 892, 'active', NOW(), NOW()),
(4, '华为 Mate 60 Pro', '麒麟9000S芯片，卫星通话，鸿蒙系统', 6999.00, 7999.00, 6, 50, 'https://images.unsplash.com/photo-1598327775660-e6215e71b7b8?w=500', '["https://images.unsplash.com/photo-1598327775660-e6215e71b7b8?w=500"]', 1205, 'active', NOW(), NOW()),
-- 电脑办公类
(5, 'MacBook Pro 16寸 M3 Max', '苹果最强笔记本，M3 Max芯片，36GB内存', 24999.00, 26999.00, 7, 30, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500', '["https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500"]', 156, 'active', NOW(), NOW()),
(6, 'Dell XPS 15', '4K OLED屏，RTX 4070，创作利器', 14999.00, 16999.00, 7, 45, 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500', '["https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500"]', 234, 'active', NOW(), NOW()),
(7, 'iPad Pro 12.9寸 M2', '专业级平板，M2芯片，mini-LED屏幕', 8499.00, 9299.00, 7, 120, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', '["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"]', 445, 'active', NOW(), NOW()),
-- 智能设备类
(8, 'Apple Watch Ultra 2', '专业运动手表，钛金属表壳，100米防水', 6499.00, 6999.00, 9, 150, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', '["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500"]', 678, 'active', NOW(), NOW()),
(9, 'AirPods Pro 2', '主动降噪，空间音频，USB-C充电', 1899.00, 2299.00, 9, 300, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500"]', 1234, 'active', NOW(), NOW()),
(10, 'Sony WH-1000XM5', '行业顶级降噪，30小时续航', 2499.00, 2999.00, 9, 200, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', '["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500"]', 892, 'active', NOW(), NOW()),
-- 男装类
(11, '纯棉休闲T恤', '100%纯棉，透气舒适，多色可选', 99.00, 199.00, 10, 500, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"]', 2341, 'active', NOW(), NOW()),
(12, '商务休闲衬衫', '免烫面料，修身版型，商务必备', 299.00, 499.00, 10, 300, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500', '["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500"]', 1123, 'active', NOW(), NOW()),
(13, '修身牛仔裤', '弹力面料，修身剪裁，时尚百搭', 199.00, 399.00, 10, 400, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"]', 1856, 'active', NOW(), NOW()),
-- 女装类
(14, '法式连衣裙', '优雅设计，舒适面料，春夏必备', 399.00, 699.00, 11, 250, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500"]', 1567, 'active', NOW(), NOW()),
(15, '针织开衫', '柔软舒适，百搭款式，多色可选', 259.00, 459.00, 11, 350, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500', '["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500"]', 987, 'active', NOW(), NOW()),
-- 食品生鲜类
(16, '智利车厘子 JJ级 2kg', '新鲜空运，甜美多汁，进口品质', 299.00, 399.00, 14, 100, 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', '["https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500"]', 2345, 'active', NOW(), NOW()),
(17, '阳光玫瑰葡萄 3斤', '皮薄肉脆，香甜可口，产地直发', 89.00, 129.00, 14, 150, 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500', '["https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500"]', 1234, 'active', NOW(), NOW()),
(18, '有机燕麦片 1kg', '营养早餐，富含膳食纤维，健康首选', 39.90, 59.90, 16, 300, 'https://images.unsplash.com/photo-1517093725432-a9ac7b9c3be8?w=500', '["https://images.unsplash.com/photo-1517093725432-a9ac7b9c3be8?w=500"]', 3456, 'active', NOW(), NOW()),
-- 家居日用类
(19, '北欧风收纳盒三件套', '简约设计，多功能收纳，居家必备', 79.00, 129.00, 19, 200, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500"]', 1567, 'active', NOW(), NOW()),
(20, '纯棉床上四件套', '亲肤面料，精美图案，提升睡眠质量', 299.00, 499.00, 18, 150, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500', '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500"]', 892, 'active', NOW(), NOW()),
-- 美妆个护类
(21, 'SK-II 神仙水 230ml', '经典护肤精华，改善肤质，提亮肤色', 1540.00, 1899.00, 5, 80, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500', '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500"]', 678, 'active', NOW(), NOW()),
(22, '雅诗兰黛小棕瓶 50ml', '修护精华，抗老紧致，夜间修护', 850.00, 1080.00, 5, 100, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', '["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500"]', 923, 'active', NOW(), NOW()),
(23, '戴森吹风机 HD15', '快速干发，智能温控，呵护秀发', 2999.00, 3499.00, 5, 60, 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500', '["https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500"]', 445, 'active', NOW(), NOW()),
-- 鞋靴类
(24, 'Nike Air Force 1', '经典板鞋，百搭款式，舒适耐穿', 749.00, 899.00, 12, 200, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500"]', 2134, 'active', NOW(), NOW()),
(25, 'Adidas Ultraboost 22', '专业跑鞋，缓震回弹，运动首选', 1099.00, 1399.00, 12, 150, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500', '["https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500"]', 1234, 'active', NOW(), NOW());

-- ============================================
-- 4. 轮播图数据
-- ============================================
INSERT INTO `banner` (`id`, `title`, `image_url`, `link_url`, `sort_order`, `status`, `create_date`, `update_date`) VALUES
(1, '春季大促 全场5折起', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', '/category/2', 1, 'active', NOW(), NOW()),
(2, 'iPhone 15 系列新品上市', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=1200', '/product/1', 2, 'active', NOW(), NOW()),
(3, '数码狂欢节', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200', '/category/1', 3, 'active', NOW(), NOW()),
(4, '品质生活节', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', '/category/4', 4, 'active', NOW(), NOW()),
(5, '美妆护肤专场', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200', '/category/5', 5, 'active', NOW(), NOW());

-- ============================================
-- 5. 地址数据
-- ============================================
INSERT INTO `address` (`id`, `user_id`, `receiver_name`, `receiver_phone`, `province`, `city`, `district`, `detail_address`, `is_default`, `create_date`, `update_date`) VALUES
(1, 2, '张三', '13800138001', '北京市', '北京市', '朝阳区', '建国路88号SOHO现代城1号楼1801室', 1, NOW(), NOW()),
(2, 2, '张三', '13800138001', '上海市', '上海市', '浦东新区', '陆家嘴环路1000号恒生银行大厦28楼', 0, NOW(), NOW()),
(3, 3, '李四', '13800138002', '广东省', '深圳市', '南山区', '科技园南区腾讯大厦', 1, NOW(), NOW()),
(4, 4, '王五', '13800138003', '浙江省', '杭州市', '西湖区', '文三路478号华星时代广场', 1, NOW(), NOW()),
(5, 5, '赵六', '13800138004', '四川省', '成都市', '高新区', '天府大道北段1700号环球中心', 1, NOW(), NOW());

-- ============================================
-- 6. 购物车数据
-- ============================================
INSERT INTO `cart` (`id`, `user_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`, `selected`, `create_date`, `update_date`) VALUES
(1, 2, 1, 'iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500', 9999.00, 1, 1, NOW(), NOW()),
(2, 2, 9, 'AirPods Pro 2', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', 1899.00, 2, 1, NOW(), NOW()),
(3, 2, 11, '纯棉休闲T恤', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 99.00, 3, 0, NOW(), NOW()),
(4, 3, 3, 'Xiaomi 14 Pro', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 4999.00, 1, 1, NOW(), NOW()),
(5, 3, 16, '智利车厘子 JJ级 2kg', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', 299.00, 2, 1, NOW(), NOW()),
(6, 4, 5, 'MacBook Pro 16寸 M3 Max', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500', 24999.00, 1, 1, NOW(), NOW()),
(7, 5, 24, 'Nike Air Force 1', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', 749.00, 2, 1, NOW(), NOW()),
(8, 5, 25, 'Adidas Ultraboost 22', 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500', 1099.00, 1, 1, NOW(), NOW());

-- ============================================
-- 7. 订单数据
-- ============================================
INSERT INTO `order` (`id`, `order_no`, `user_id`, `total_amount`, `pay_amount`, `status`, `pay_status`, `pay_type`, `pay_time`, `ship_time`, `express_company`, `express_no`, `receiver_name`, `receiver_phone`, `receiver_address`, `remark`, `create_date`, `update_date`) VALUES
-- 已支付已发货订单
(1, 'ORD202402070001', 2, 10198.00, 9998.00, 'shipped', 'paid', 'alipay', '2024-02-05 10:00:00', '2024-02-06 14:00:00', '顺丰速运', 'SF1234567890', '张三', '13800138001', '北京市 北京市 朝阳区 建国路88号SOHO现代城1号楼1801室', '请尽快发货', '2024-02-04 09:00:00', NOW()),
(2, 'ORD202402060002', 3, 4999.00, 4899.00, 'shipped', 'paid', 'wechat', '2024-02-03 11:00:00', '2024-02-04 16:00:00', '京东物流', 'JD9876543210', '李四', '13800138002', '广东省 深圳市 南山区 科技园南区腾讯大厦', '', '2024-02-02 08:00:00', NOW()),
-- 已支付待发货订单
(3, 'ORD202402070003', 4, 24999.00, 24499.00, 'paid', 'paid', 'alipay', '2024-02-06 15:00:00', NULL, '', '', '王五', '13800138003', '浙江省 杭州市 西湖区 文三路478号华星时代广场', '需要发票', '2024-02-06 15:00:00', NOW()),
(4, 'ORD202402070004', 5, 2198.00, 2098.00, 'paid', 'paid', 'wechat', '2024-02-07 10:00:00', NULL, '', '', '赵六', '13800138004', '四川省 成都市 高新区 天府大道北段1700号环球中心', '', '2024-02-07 10:00:00', NOW()),
-- 待支付订单
(5, 'ORD202402070005', 2, 299.00, 279.00, 'pending', 'unpaid', '', NULL, NULL, '', '', '张三', '13800138001', '北京市 北京市 朝阳区 建国路88号SOHO现代城1号楼1801室', '', NOW(), NOW()),
-- 已完成订单
(6, 'ORD202402010006', 3, 89.00, 79.00, 'completed', 'paid', 'alipay', '2024-01-30 09:00:00', '2024-01-31 13:00:00', '中通快递', 'ZT555666777', '李四', '13800138002', '广东省 深圳市 南山区 科技园南区腾讯大厦', '', '2024-01-29 08:00:00', NOW()),
(7, 'ORD202402010007', 2, 1899.00, 1799.00, 'completed', 'paid', 'wechat', '2024-01-30 10:00:00', '2024-01-31 14:00:00', '圆通速递', 'YT888999000', '张三', '13800138001', '北京市 北京市 朝阳区 建国路88号SOHO现代城1号楼1801室', '', '2024-01-29 09:00:00', NOW()),
-- 已取消订单
(8, 'ORD202402050008', 4, 4999.00, 0.00, 'cancelled', 'unpaid', '', NULL, NULL, '', '', '王五', '13800138003', '浙江省 杭州市 西湖区 文三路478号华星时代广场', '不想要了', '2024-02-05 11:00:00', NOW());

-- ============================================
-- 8. 订单项数据
-- ============================================
INSERT INTO `order_item` (`id`, `order_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`, `subtotal`, `create_date`) VALUES
-- 订单1: iPhone + AirPods
(1, 1, 1, 'iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500', 9999.00, 1, 9999.00, '2024-02-04 09:00:00'),
(2, 1, 9, 'AirPods Pro 2', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', 1899.00, 1, 1899.00, '2024-02-04 09:00:00'),
-- 订单2: 小米手机
(3, 2, 3, 'Xiaomi 14 Pro', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 4999.00, 1, 4999.00, '2024-02-02 08:00:00'),
-- 订单3: MacBook Pro
(4, 3, 5, 'MacBook Pro 16寸 M3 Max', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500', 24999.00, 1, 24999.00, '2024-02-06 15:00:00'),
-- 订单4: 运动鞋两双
(5, 4, 24, 'Nike Air Force 1', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', 749.00, 2, 1498.00, '2024-02-07 10:00:00'),
(6, 4, 18, '有机燕麦片 1kg', 'https://images.unsplash.com/photo-1517093725432-a9ac7b9c3be8?w=500', 39.90, 2, 79.80, '2024-02-07 10:00:00'),
-- 订单5: 待支付
(7, 5, 16, '智利车厘子 JJ级 2kg', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500', 299.00, 1, 299.00, NOW()),
-- 订单6: 已完成-葡萄
(8, 6, 17, '阳光玫瑰葡萄 3斤', 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500', 89.00, 1, 89.00, '2024-01-29 08:00:00'),
-- 订单7: 已完成-耳机
(9, 7, 9, 'AirPods Pro 2', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', 1899.00, 1, 1899.00, '2024-01-29 09:00:00'),
-- 订单8: 已取消
(10, 8, 4, '华为 Mate 60 Pro', 'https://images.unsplash.com/photo-1598327775660-e6215e71b7b8?w=500', 6999.00, 1, 6999.00, '2024-02-05 11:00:00');

-- ============================================
-- 9. 支付记录数据
-- ============================================
INSERT INTO `payment` (`id`, `order_id`, `order_no`, `transaction_id`, `pay_type`, `amount`, `status`, `pay_time`, `callback_time`, `remark`, `create_date`, `update_date`) VALUES
(1, 1, 'ORD202402070001', '2024020722001156789012345678', 'alipay', 9998.00, 'success', '2024-02-05 10:00:00', '2024-02-05 10:00:00', 'iPhone订单支付', '2024-02-05 10:00:00', NOW()),
(2, 2, 'ORD202402060002', '4200002024020698765432109876', 'wechat', 4899.00, 'success', '2024-02-03 11:00:00', '2024-02-03 11:00:00', '小米手机订单支付', '2024-02-03 11:00:00', NOW()),
(3, 3, 'ORD202402070003', '2024020722001156789012345679', 'alipay', 24499.00, 'success', '2024-02-06 15:00:00', '2024-02-06 15:00:00', 'MacBook订单支付', '2024-02-06 15:00:00', NOW()),
(4, 4, 'ORD202402070004', '4200002024020798765432109877', 'wechat', 2098.00, 'success', '2024-02-07 10:00:00', '2024-02-07 10:00:00', '运动鞋订单支付', '2024-02-07 10:00:00', NOW()),
(5, 6, 'ORD202402010006', '2024020122001156789012345680', 'alipay', 79.00, 'success', '2024-01-30 09:00:00', '2024-01-30 09:00:00', '葡萄订单支付', '2024-01-30 09:00:00', NOW()),
(6, 7, 'ORD202402010007', '4200002024020198765432109878', 'wechat', 1799.00, 'success', '2024-01-30 10:00:00', '2024-01-30 10:00:00', '耳机订单支付', '2024-01-30 10:00:00', NOW());

-- ============================================
-- 数据插入完成
-- ============================================
SELECT '初始数据插入完成！' AS message;
SELECT CONCAT('用户: ', COUNT(*)) AS stats FROM `user`;
SELECT CONCAT('分类: ', COUNT(*)) AS stats FROM `category`;
SELECT CONCAT('商品: ', COUNT(*)) AS stats FROM `product`;
SELECT CONCAT('轮播图: ', COUNT(*)) AS stats FROM `banner`;
SELECT CONCAT('地址: ', COUNT(*)) AS stats FROM `address`;
SELECT CONCAT('购物车: ', COUNT(*)) AS stats FROM `cart`;
SELECT CONCAT('订单: ', COUNT(*)) AS stats FROM `order`;
SELECT CONCAT('订单项: ', COUNT(*)) AS stats FROM `order_item`;
SELECT CONCAT('支付记录: ', COUNT(*)) AS stats FROM `payment`;
