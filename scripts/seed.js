/**
 * 数据导入脚本 - 导入初始数据
 */

const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

// 读取项目数据库配置
const { mysqlOptions } = require('../mysql.config.js');

async function seed() {
    console.log('🌱 开始导入初始数据...\n');
    console.log('数据库配置:', {
        host: mysqlOptions.host,
        port: mysqlOptions.port,
        database: mysqlOptions.database
    });

        let connection;
        try {
            connection = await mysql.createConnection({
                host: mysqlOptions.host,
                port: mysqlOptions.port,
                user: mysqlOptions.user,
                password: mysqlOptions.password,
                database: mysqlOptions.database,
                multipleStatements: true
            });

            console.log('✅ 数据库连接成功!\n');

            // 清空现有数据
            console.log('🧹 正在清空现有数据...');
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');
            const tables = ['payment', 'order_item', '`order`', 'cart', 'address', 'banner', 'product', 'category', 'user'];
            for (const table of tables) {
                try {
                    await connection.query(`TRUNCATE TABLE ${table}`);
                    console.log(`  ✓ 已清空 ${table}`);
                } catch (e) {
                    console.log(`  ⚠️ ${table} 清空失败: ${e.message}`);
                }
            }
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('');

            // 读取 SQL 文件
            const sqlPath = path.join(__dirname, '..', 'server', 'sql', 'seed_data.sql');
            const sql = fs.readFileSync(sqlPath, 'utf8');

            console.log('📥 正在导入初始数据...');
            await connection.query(sql);

            console.log('\n✅ 数据导入完成!\n');

            // 显示统计
            const statsTables = [
                { name: 'user', label: '用户' },
                { name: 'category', label: '分类' },
                { name: 'product', label: '商品' },
                { name: 'banner', label: '轮播图' },
                { name: 'address', label: '地址' },
                { name: 'cart', label: '购物车' },
                { name: 'order', label: '订单' },
                { name: 'order_item', label: '订单项' },
                { name: 'payment', label: '支付记录' }
            ];

            console.log('📊 数据统计:');
            console.log('-'.repeat(30));
            for (const { name, label } of statsTables) {
                const [rows] = await connection.query(
                    `SELECT COUNT(*) as count FROM \`${name}\``
                );
                console.log(`  ${label.padEnd(8)} : ${rows[0].count} 条`);
            }
            console.log('-'.repeat(30));

            console.log('\n🎉 导入成功！现在可以启动项目了:');
            console.log('   npm run dev');
            console.log('\n默认登录账号:');
            console.log('   管理员: admin');
            console.log('   用户: user001 / user002 / user003 / user004');

    } catch (err) {
        console.error('\n❌ 导入失败:', err.message);
        console.error('\n请检查:');
        console.error('  1. MySQL 是否已启动');
        console.error('  2. 数据库配置是否正确 (mysql.config.js)');
        console.error('  3. 数据库 nsgm_shop 是否已创建');
        console.error('\n你可以手动创建数据库:');
        console.error('  mysql -u root -p -e "CREATE DATABASE nsgm_shop;"');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

seed();
