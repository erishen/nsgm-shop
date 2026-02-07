CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use nsgm_shop;

CREATE TABLE IF NOT EXISTS `payment` (
  `id` integer AUTO_INCREMENT COMMENT '主键',
  `order_id` integer NOT NULL COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单编号',
  `transaction_id` varchar(100) NOT NULL COMMENT '第三方交易号',
  `pay_type` varchar(20) NOT NULL COMMENT '支付方式',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `status` varchar(20) NOT NULL COMMENT '支付状态',
  `pay_time` TIMESTAMP(3) DEFAULT NULL COMMENT '支付时间',
  `callback_time` TIMESTAMP(3) DEFAULT NULL COMMENT '回调时间',
  `remark` text DEFAULT NULL COMMENT '备注',
  `create_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;