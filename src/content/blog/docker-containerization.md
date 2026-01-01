---
title: Docker容器化部署最佳实践
description: 从零开始学习Docker，掌握容器化应用开发和部署的完整流程
date: 2024-12-28
readTime: 14 分钟
category: DevOps
tags: ['Docker', '容器化', '部署']
---

# Docker容器化部署最佳实践

## 引言

Docker已经成为现代应用部署的标准工具。本文将详细介绍Docker的核心概念、常用命令以及生产环境中的最佳实践。

## Docker核心概念

### 镜像（Image）

镜像是一个只读的模板，包含运行应用所需的所有内容：代码、运行时、库、环境变量和配置文件。

### 容器（Container）

容器是镜像的运行实例。可以启动、停止、删除容器，且彼此隔离。

### Dockerfile

Dockerfile是一个文本文件，包含构建Docker镜像的指令。

## Dockerfile最佳实践

### 最小化镜像大小

```dockerfile
# ❌ 不好：使用完整的基础镜像
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y python3

# ✅ 好：使用Alpine基础镜像
FROM python:3.9-alpine
```

### 合并RUN指令

```dockerfile
# ❌ 不好：多个RUN指令增加层数
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get clean

# ✅ 好：合并RUN指令
RUN apt-get update && \
    apt-get install -y python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 利用构建缓存

```dockerfile
# 先复制依赖文件，利用缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制应用代码
COPY . .
```

### 多阶段构建

```dockerfile
# 构建阶段
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Docker Compose

Docker Compose用于定义和运行多容器应用。

### docker-compose.yml示例

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose up --build
```

## 生产环境最佳实践

### 1. 使用非root用户

```dockerfile
FROM python:3.9-slim

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

### 2. 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5000/health || exit 1
```

### 3. 资源限制

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

### 4. 使用环境变量

```dockerfile
ENV APP_ENV=production
ENV APP_PORT=5000
```

### 5. 签名和扫描镜像

```bash
# 签名镜像
docker trust sign myapp:latest

# 扫描漏洞
docker scan myapp:latest
```

## 性能优化

### 1. 使用多阶段构建减少镜像大小

### 2. 优化层缓存顺序

```dockerfile
# 先复制变化少的文件
COPY package*.json ./
RUN npm install

# 再复制变化多的文件
COPY . .
```

### 3. 使用.dockerignore

```
node_modules
npm-debug.log
.git
.env
```

### 4. 选择合适的基础镜像

- **alpine**: 最小化镜像，适合静态文件
- **slim**: Debian精简版，平衡大小和兼容性
- **默认**: 完整功能，开发环境使用

## 安全实践

1. **定期更新基础镜像**
2. **使用非root用户运行**
3. **扫描镜像漏洞**
4. **不在镜像中存储敏感信息**
5. **限制容器权限**

## 监控和日志

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 总结

Docker容器化的最佳实践包括：

1. **最小化镜像** - 使用Alpine或精简版基础镜像
2. **优化Dockerfile** - 合并指令、利用缓存、多阶段构建
3. **安全配置** - 非root用户、定期扫描
4. **资源管理** - 设置限制和健康检查
5. **监控日志** - 配置日志收集和监控

掌握这些实践，你就能构建出高效、安全、可维护的容器化应用。
