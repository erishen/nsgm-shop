CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use nsgm_shop;

CREATE TABLE IF NOT EXISTS `user` (
  `id` integer AUTO_INCREMENT COMMENT '主键',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `nickname` varchar(100) NOT NULL COMMENT '昵称',
  `real_name` varchar(50) DEFAULT NULL DEFAULT '' COMMENT '真实姓名',
  `avatar` varchar(500) DEFAULT NULL DEFAULT '' COMMENT '头像',
  `phone` varchar(20) DEFAULT NULL DEFAULT '' COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL DEFAULT '' COMMENT '邮箱',
  `status` varchar(20) NOT NULL COMMENT '状态',
  `create_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;