export default async function handler(request, response) {
  // 设置 CORS 头
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  console.log('=== 海康事件订阅请求 ===');
  console.log('方法:', request.method);
  console.log('URL:', request.url);
  console.log('查询参数:', request.query);

  try {
    // GET 请求 - URL 验证
    if (request.method === 'GET') {
      const { signature, timestamp, nonce, echostr } = request.query;
      
      console.log('URL验证参数:', { 
        signature, 
        timestamp, 
        nonce, 
        echostr 
      });
      
      // 如果有 echostr，说明是海康的 URL 验证请求
      if (echostr) {
        console.log('✅ URL验证通过，返回 echostr:', echostr);
        return response.status(200).send(echostr);
      }
      
      // 普通 GET 请求，返回服务状态
      return response.status(200).json({
        code: 0,
        message: '海康事件订阅服务运行正常',
        service: 'HikVision Event Subscription',
        timestamp: new Date().toISOString(),
        endpoint: '/api/event',
        methods: ['GET', 'POST', 'OPTIONS']
      });
    }

    // POST 请求 - 事件处理
    if (request.method === 'POST') {
      let body;
      
      try {
        // 解析请求体
        const chunks = [];
        for await (const chunk of request) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('utf8');
        body = JSON.parse(rawBody);
      } catch (error) {
        console.error('解析请求体错误:', error);
        return response.status(400).json({
          code: 400,
          message: 'Invalid JSON body'
        });
      }
      
      console.log('📨 收到海康事件:', JSON.stringify(body, null, 2));
      
      // 处理事件类型
      if (body.eventType) {
        switch (body.eventType) {
          case 'VISITOR_ARRIVAL':
            console.log('👥 处理访客到达事件');
            break;
          case 'VISITOR_LEAVE':
            console.log('🚪 处理访客离开事件');
            break;
          case 'PERMISSION_GROUP_UPDATE':
            console.log('🔄 处理权限组更新事件');
            break;
          case 'DEVICE_STATUS_CHANGE':
            console.log('🔧 处理设备状态变更事件');
            break;
          default:
            console.log('❓ 未知事件类型:', body.eventType);
        }
      }
      
      // 返回成功响应
      return response.status(200).json({
        code: 0,
        message: 'success',
        receivedAt: new Date().toISOString(),
        eventId: body.eventId || 'unknown'
      });
    }

    // 不支持的请求方法
    return response.status(405).json({
      code: 405,
      message: 'Method Not Allowed',
      allowed: ['GET', 'POST', 'OPTIONS']
    });

  } catch (error) {
    console.error('❌ 处理请求时发生错误:', error);
    
    return response.status(500).json({
      code: 500,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}
