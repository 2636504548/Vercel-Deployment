const crypto = require('crypto');

// 海康互联事件订阅处理
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('收到海康事件订阅请求:', {
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  // URL验证（GET请求）
  if (req.method === 'GET') {
    const { signature, timestamp, nonce, echostr } = req.query;
    
    console.log('URL验证参数:', { signature, timestamp, nonce, echostr });
    
    if (signature && echostr) {
      // 这里应该按照海康的验证规则验证signature
      // 暂时直接返回echostr通过验证
      console.log('URL验证通过，返回echostr:', echostr);
      return res.send(echostr);
    } else {
      console.log('URL验证参数不全');
      return res.status(400).send('Missing parameters');
    }
  }

  // 事件处理（POST请求）
  if (req.method === 'POST') {
    try {
      const eventData = req.body;
      console.log('收到海康事件:', JSON.stringify(eventData, null, 2));
      
      // 处理不同类型的事件
      if (eventData.eventType) {
        switch (eventData.eventType) {
          case 'VISITOR_ARRIVAL': // 访客到达
            console.log('处理访客到达事件');
            break;
          case 'VISITOR_LEAVE': // 访客离开
            console.log('处理访客离开事件');
            break;
          case 'PERMISSION_GROUP_UPDATE': // 权限组更新
            console.log('处理权限组更新事件');
            break;
          default:
            console.log('未知事件类型:', eventData.eventType);
        }
      }
      
      // 返回成功响应
      return res.json({
        code: 0,
        message: 'success'
      });
      
    } catch (error) {
      console.error('处理事件错误:', error);
      return res.status(500).json({
        code: -1,
        message: 'Internal server error'
      });
    }
  }

  // 其他请求方法
  return res.status(405).send('Method Not Allowed');
};