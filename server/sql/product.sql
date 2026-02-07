CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use nsgm_shop;

CREATE TABLE IF NOT EXISTS `product` (
  `id` integer AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) NOT NULL COMMENT '商品名称',
  `description` text DEFAULT NULL COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `category_id` integer NOT NULL COMMENT '分类ID',
  `stock` integer NOT NULL COMMENT '库存',
  `image_url` varchar(500) DEFAULT NULL DEFAULT '' COMMENT '主图',
  `images` text DEFAULT NULL COMMENT '商品图集(JSON数组)',
  `sales` integer DEFAULT NULL COMMENT '销量',
  `status` varchar(20) NOT NULL COMMENT '状态',
  `create_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;