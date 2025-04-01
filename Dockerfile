FROM node:18

WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装全局依赖（pnpm 和 pm2）
RUN npm install -g pnpm pm2

# 安装项目依赖
RUN pnpm install --prod

# 复制项目代码
COPY . .

EXPOSE 29061

# 使用 pm2 启动应用
CMD ["pm2-runtime", "index.js"]