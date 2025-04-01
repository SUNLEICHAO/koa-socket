const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');
const { sendDeviceData } = require('./controllers/deviceController');

// 初始化Koa应用
const app = new Koa();
const router = new Router();

// 中间件
app.use(bodyParser());
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  await next();
});

// 路由
router.get('/', async (ctx) => {
  ctx.body = { message: '设备监控服务已启动' };
});

app.use(router.routes()).use(router.allowedMethods());

// 创建HTTP服务器
const server = http.createServer(app.callback());

// 创建WebSocket服务器
const wss = new WebSocket.Server({ noServer: true });

// 存储所有连接的客户端
const clients = new Map();

// 处理WebSocket连接
wss.on('connection', (ws, request, username) => {
  const clientId = uuidv4();
  const clientInfo = { id: clientId, username, ws };
  
  // 存储客户端连接
  clients.set(clientId, clientInfo);
  
  console.log(`客户端 ${username} (${clientId}) 已连接`);
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connection',
    message: `欢迎 ${username}，连接成功！`,
    clientId
  }));
  
  // 开始模拟数据发送
  sendDeviceData(ws);
  
  // 处理接收到的消息
  ws.on('message', (message) => {
    console.log(`收到来自 ${username} 的消息: ${message}`);
    try {
      const data = JSON.stringify(message);
      // 处理不同类型的消息...
    } catch (error) {
      console.error('消息解析错误:', error);
    }
  });
  
  // 处理连接关闭
  ws.on('close', () => {
    console.log(`客户端 ${username} (${clientId}) 已断开连接`);
    clients.delete(clientId);
  });
});

// 处理HTTP服务器升级请求
server.on('upgrade', (request, socket, head) => {
  const { pathname, query } = url.parse(request.url, true);
  
  // 检查路径是否为/terminal
  if (pathname === '/terminal') {
    // 从查询参数中提取code，用作用户名
    const username = query.code || 'anonymous';
    
    // 处理WebSocket握手
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, username);
    });
  } else {
    socket.destroy();
  }
});

// 启动服务器
const PORT = config.PORT || 29061;
server.listen(PORT, () => {
  console.log(`服务器运行在: http://localhost:${PORT}`);
  console.log(`WebSocket服务运行在: ws://localhost:${PORT}/terminal?code={username}`);
}); 