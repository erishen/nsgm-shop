CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use nsgm_shop;

CREATE TABLE IF NOT EXISTS `cart` (
  `id` integer AUTO_INCREMENT COMMENT '主键',
  `user_id` integer NOT NULL COMMENT '用户ID',
  `product_id` integer NOT NULL COMMENT '商品ID',
  `product_name` varchar(255) NOT NULL COMMENT '商品名称',
  `product_image` varchar(500) DEFAULT NULL DEFAULT '' COMMENT '商品图片',
  `price` decimal(10,2) NOT NULL COMMENT '单价',
  `quantity` integer NOT NULL COMMENT '数量',
  `selected` integer NOT NULL COMMENT '是否选中',
  `create_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;