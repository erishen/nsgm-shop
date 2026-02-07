CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use nsgm_shop;

CREATE TABLE IF NOT EXISTS `category` (
  `id` integer AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `icon` varchar(255) DEFAULT NULL DEFAULT '' COMMENT '分类图标',
  `parent_id` integer DEFAULT NULL COMMENT '父分类ID',
  `sort_order` integer NOT NULL COMMENT '排序',
  `status` varchar(20) NOT NULL COMMENT '状态',
  `create_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;