# 测试数据导入指南

## 方案一：安装 MySQL 并导入（推荐）

### 步骤 1：安装 MySQL 8.0

**Windows 用户**：
1. 下载 MySQL Installer：https://dev.mysql.com/downloads/installer/
2. 选择 "MySQL Server 8.0"
3. 设置 root 密码（记住它！）
4. 完成安装

**或使用 Chocolatey（更简单）**：
```powershell
# 以管理员身份运行
choco install mysql -y
```

### 步骤 2：创建数据库

```powershell
# 登录 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行：
CREATE DATABASE cpt CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'cpt_user'@'localhost' IDENTIFIED BY 'CPT2026Password!';
GRANT ALL PRIVILEGES ON cpt.* TO 'cpt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 步骤 3：导入 Schema 和测试数据

```powershell
cd C:\Users\飞机哥\.qclaw\workspace-op-5f04fe9a-0fae-4012-a46c-d9e235f99c8d\china-deep-travel

# 导入 Schema（建表 + 种子数据）
mysql -u cpt_user -p cpt < db/schema.mysql.sql

# 导入测试数据
mysql -u cpt_user -p cpt < db/test-data.mysql.sql
```

### 步骤 4：配置 .env.local

```powershell
# 修改项目根目录的 .env.local
@"
DATABASE_URL=mysql://cpt_user:CPT2026Password!@localhost:3306/cpt
JWT_SECRET=dev-demo-secret-change-me-in-production-32chars
NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### 步骤 5：重启开发服务器

```powershell
# 停止当前服务器（Ctrl+C）
npm run dev
```

---

## 方案二：使用 Docker（更简单）

### 安装 Docker Desktop
https://www.docker.com/products/docker-desktop/

### 启动 MySQL 容器
```powershell
docker run --name cpt-mysql `
  -e MYSQL_ROOT_PASSWORD=root123 `
  -e MYSQL_DATABASE=cpt `
  -e MYSQL_USER=cpt_user `
  -e MYSQL_PASSWORD=CPT2026Password! `
  -p 3306:3306 `
  -d mysql:8.0 `
  --character-set-server=utf8mb4 `
  --collation-server=utf8mb4_general_ci
```

### 等待 30 秒后导入数据
```powershell
# 等待 MySQL 启动
Start-Sleep -Seconds 30

# 导入 Schema
docker exec -i cpt-mysql mysql -u cpt_user -pCPT2026Password! cpt < db/schema.mysql.sql

# 导入测试数据
docker exec -i cpt-mysql mysql -u cpt_user -pCPT2026Password! cpt < db/test-data.mysql.sql
```

---

## 测试数据概览

导入后将包含：

### 👥 用户（10 个测试用户）
- **充足积分用户**：850 积分，已解锁 10 篇文章
- **普通用户**：320 积分
- **积分不足用户**：8 积分（测试充值流程）
- **活跃用户**：1250 积分
- **新用户**：20 积分（欢迎赠送）

### 📝 文章（20 篇攻略）
**北京（3 篇）**：
- 故宫深度攻略（付费 20 pts，精选）
- 长城徒步路线（付费 25 pts）
- 北京美食指南（免费，引流）

**上海（3 篇）**：
- 外滩夜景摄影（付费 18 pts，精选）
- 隐藏咖啡馆（付费 15 pts）
- 苏州园林（付费 12 pts）

**丝绸之路（4 篇）**：
- 敦煌莫高窟（付费 30 pts，精选）
- 西安古都（付费 22 pts）
- 喀什古城（付费 28 pts）

**云南（3 篇）**：
- 大理丽江慢旅行（付费 28 pts，精选）
- 香格里拉秘境（付费 25 pts）
- 西双版纳（付费 18 pts）

**成都（2 篇）**：
- 熊猫+火锅（付费 20 pts）
- 九寨沟（付费 22 pts）

**其他城市（5 篇）**：
- 黄山、张家界、桂林、哈尔滨、青岛等

### 💰 订单（15 个）
- **已完成**：10 个（总金额 $190 USD）
- **待支付**：2 个
- **已退款**：2 个
- **失败**：1 个

### 🎯 积分交易（22 条）
覆盖：
- 充值记录
- 文章解锁
- 退款回退
- 欢迎赠送

### 📰 已解锁文章（17 条）
模拟真实解锁记录

### 📺 广告（7 个）
覆盖所有 6 个广告位

---

## 验证导入结果

```powershell
# 登录 MySQL
mysql -u cpt_user -p

# 切换数据库
USE cpt;

# 查看统计
SELECT 'Users' as Type, COUNT(*) as Count FROM users WHERE role = 'user'
UNION ALL
SELECT 'Articles', COUNT(*) FROM articles WHERE status = 'published'
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Ads', COUNT(*) FROM advertisements WHERE is_active = true;
```

---

## 测试账号

### 普通用户
- 邮箱：`john.traveler@gmail.com`
- 积分：850 pts
- 已解锁：10 篇文章

### 积分不足用户
- 邮箱：`mike.explorer@yahoo.com`
- 积分：8 pts
- 用于测试充值流程

### 新用户
- 邮箱：`david.newbie@protonmail.com`
- 积分：20 pts（欢迎赠送）
- 用于测试新用户体验

### 管理员
- 邮箱：`admin@chinadeeptravel.com`
- 密码：`Admin#2024`

---

## 无数据库的 Demo 模式

如果暂时不想安装 MySQL，项目已支持 **Demo 模式**：

1. 确保 `.env.local` 中 `DATABASE_URL` 为空或不存在
2. 启动开发服务器：`npm run dev`
3. 访问 http://localhost:3000
4. 所有功能都能预览（使用内置模拟数据）

Demo 模式特点：
- ✅ 页面正常渲染
- ✅ 功能完整可测试
- ⚠️ 数据刷新后丢失
- ⚠️ 写入操作模拟成功

---

## 下一步

导入成功后：

1. **重启开发服务器**
2. **访问首页**：http://localhost:3000
3. **登录测试账号**：john.traveler@gmail.com（任意密码）
4. **测试充值流程**：访问 /pricing 选择套餐
5. **测试解锁文章**：浏览文章详情，点击解锁
6. **测试后台管理**：访问 /admin

---

## 问题排查

### 连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**解决**：检查 MySQL 服务是否启动

### 密码错误
```
Access denied for user 'cpt_user'@'localhost'
```
**解决**：确认 .env.local 中的密码与 MySQL 设置一致

### 字符集问题
```
Incorrect string value
```
**解决**：确保数据库使用 utf8mb4 字符集
