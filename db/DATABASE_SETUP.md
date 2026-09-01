# 本地数据库快速配置（三选一）

你的电脑目前未安装 MySQL 或 Docker。以下是三种配置方式：

---

## 方案一：最简单 — 继续使用 Demo 模式

**无需安装任何东西！**

当前项目已支持 Demo 模式，所有功能都能正常预览：

### 当前状态
- ✅ 开发服务器已启动（http://localhost:3000）
- ✅ 所有页面可访问
- ✅ 内置模拟数据（文章、用户、订单）

### Demo 数据说明
- 6 篇示例文章
- 4 个积分套餐
- 6 个广告位
- 模拟用户（任意邮箱可登录）

### 局限性
- ⚠️ 数据刷新后丢失
- ⚠️ 写入操作模拟成功（不持久化）
- ⚠️ 无法测试真实支付流程

### 建议
如果只是预览页面效果，**Demo 模式已足够**，无需安装数据库。

---

## 方案二：快速安装 — Chocolatey + MySQL

**预计耗时：10-15 分钟**

### 步骤 1：安装 Chocolatey（包管理器）

以**管理员身份**运行 PowerShell：

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 步骤 2：安装 MySQL

```powershell
choco install mysql -y
```

安装过程中会提示设置 root 密码。

### 步骤 3：创建数据库

```powershell
# 登录 MySQL
mysql -u root -p

# 在 MySQL 中执行：
CREATE DATABASE cpt CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'cpt_user'@'localhost' IDENTIFIED BY 'CPT2026Password!';
GRANT ALL PRIVILEGES ON cpt.* TO 'cpt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 步骤 4：导入数据

```powershell
cd C:\Users\飞机哥\.qclaw\workspace-op-5f04fe9a-0fae-4012-a46c-d9e235f99c8d\china-deep-travel

mysql -u cpt_user -pCPT2026Password! cpt < db/schema.mysql.sql
mysql -u cpt_user -pCPT2026Password! cpt < db/test-data.mysql.sql
```

### 步骤 5：配置项目

修改 `.env.local`：
```bash
DATABASE_URL=mysql://cpt_user:CPT2026Password!@localhost:3306/cpt
JWT_SECRET=dev-demo-secret-change-me-in-production-32chars
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 步骤 6：重启服务器

停止当前服务器（Ctrl+C），重新运行：
```powershell
npm run dev
```

---

## 方案三：云数据库 — PlanetScale（推荐生产环境）

**完全托管，无需本地安装**

### 步骤 1：注册 PlanetScale

访问：https://planetscale.com

免费套餐：
- 1 个数据库
- 1 亿行读取/月
- 1000 万行写入/月

### 步骤 2：创建数据库

1. 创建数据库 `cpt`
2. 选择区域（推荐：Singapore 或 Tokyo，延迟低）
3. 获取连接字符串

### 步骤 3：导入 Schema

```powershell
# 安装 pscale CLI
choco install planetscale -y

# 连接数据库
pscale auth login
pscale shell cpt main

# 在 shell 中执行：
source db/schema.mysql.sql
source db/test-data.mysql.sql
```

### 步骤 4：配置项目

```bash
DATABASE_URL=mysql://user:password@host.connect.psdb.cloud/cpt?sslaccept=strict
```

---

## 推荐方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| Demo 模式 | 无需安装，立即可用 | 数据不持久 | ⭐⭐⭐ 预览用 |
| 本地 MySQL | 完整功能，快速响应 | 需安装配置 | ⭐⭐⭐⭐ 开发用 |
| PlanetScale | 生产级，全球 CDN | 需注册账号 | ⭐⭐⭐⭐⭐ 上线用 |

---

## 现在就能做（无需数据库）

### 1. 访问首页
http://localhost:3000

### 2. 测试前台功能
- 浏览文章列表
- 查看文章详情
- 测试充值流程（模拟）
- 查看积分套餐

### 3. 测试后台管理
http://localhost:3000/admin

- 查看统计数据
- 管理文章
- 用户管理
- 订单管理
- 广告管理

### 4. 查看法律页面
- 隐私政策：http://localhost:3000/privacy
- 服务条款：http://localhost:3000/terms

---

## 需要我帮你安装吗？

告诉我你选择哪种方案：
1. **继续用 Demo 模式**（无需任何操作）
2. **安装本地 MySQL**（我帮你执行命令）
3. **配置 PlanetScale 云数据库**（我给你详细指导）

或者你可以先体验 Demo 模式，稍后再配置真实数据库。
