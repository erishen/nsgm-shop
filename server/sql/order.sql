CREATE DATABASE IF NOT EXISTS nsgm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

use nsgm_shop;

CREATE TABLE IF NOT EXISTS `order` (
  `id` integer AUTO_INCREMENT COMMENT '主键',
  `order_no` varchar(50) NOT NULL COMMENT '订单编号',
  `user_id` integer NOT NULL COMMENT '用户ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总额',
  `pay_amount` decimal(10,2) NOT NULL COMMENT '实付金额',
  `status` varchar(20) NOT NULL COMMENT '订单状态',
  `pay_status` varchar(20) NOT NULL COMMENT '支付状态',
  `pay_type` varchar(20) DEFAULT NULL DEFAULT '' COMMENT '支付方式',
  `pay_time` TIMESTAMP(3) DEFAULT NULL COMMENT '支付时间',
  `ship_time` TIMESTAMP(3) DEFAULT NULL COMMENT '发货时间',
  `express_company` varchar(50) DEFAULT NULL DEFAULT '' COMMENT '快递公司',
  `express_no` varchar(50) DEFAULT NULL DEFAULT '' COMMENT '快递单号',
  `receiver_name` varchar(100) NOT NULL COMMENT '收货人',
  `receiver_phone` varchar(20) NOT NULL COMMENT '收货电话',
  `receiver_address` varchar(500) NOT NULL COMMENT '收货地址',
  `remark` varchar(500) DEFAULT NULL DEFAULT '' COMMENT '备注',
  `create_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `update_date` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;