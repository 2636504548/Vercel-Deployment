const { createHash } = require('crypto');

// 存储事件日志（在生产环境中应该使用数据库）
let eventsLog = [];

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('=== 收到海康事件订阅请求 ===');
  console.log('方法:', req.method);
  console.log('URL:', req.url);
  console.log('查询参数:', req.query);
  console.log('请求头:', req.headers);

  try {
    // URL验证（GET请求）- 海康互联会发送GET请求验证URL
    if (req.method === 'GET') {
      const { signature, timestamp, nonce, echostr } = req.query;
      
      console.log('URL验证参数:', { 
        signature: signature || '未提供',
        timestamp: timestamp || '未提供', 
        nonce: nonce || '未提供',
        echostr: echostr || '未提供'
      });
      
      // 记录验证请求
      eventsLog.push({
        timestamp: new Date().toISOString(),
        type: 'URL_VERIFICATION',
        method: 'GET',
        query: req.query,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      });
      
      // 如果有echostr参数，说明是URL验证请求
      if (echostr) {
        console.log('URL验证通过，返回echostr:', echostr);
        return res.send(echostr);
      }
      
      // 如果没有echostr，返回基本信息
      return res.json({
        code: 0,
        message: '海康事件订阅服务运行正常',
        service: 'HikVision Event Subscription',
        timestamp: new Date().toISOString(),
        events_count: eventsLog.length,
        recent_events: eventsLog.slice(-5)
      });
    }

    // 事件处理（POST请求）
    if (req.method === 'POST') {
      let eventData;
      
      // 解析请求体
      if (typeof req.body === 'string') {
        try {
          eventData = JSON.parse(req.body);
        } catch (e) {
          eventData = req.body;
        }
      } else {
        eventData = req.body;
      }
      
      console.log('收到海康事件数据:', JSON.stringify(eventData, null, 2));
      
      // 记录事件
      const eventRecord = {
        timestamp: new Date().toISOString(),
        type: 'EVENT_RECEIVED',
        method: 'POST',
        data: eventData,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };
      
      eventsLog.push(eventRecord);
      
      // 只保留最近100个事件
      if (eventsLog.length > 100) {
        eventsLog = eventsLog.slice(-100);
      }
      
      // 处理不同类型的事件
      if (eventData && eventData.eventType) {
        switch (eventData.eventType) {
          case 'VISITOR_ARRIVAL': // 访客到达
            console.log('处理访客到达事件');
            handleVisitorArrival(eventData);
            break;
          case 'VISITOR_LEAVE': // 访客离开
            console.log('处理访客离开事件');
            handleVisitorLeave(eventData);
            break;
          case 'PERMISSION_GROUP_UPDATE': // 权限组更新
            console.log('处理权限组更新事件');
            handlePermissionGroupUpdate(eventData);
            break;
          case 'DEVICE_STATUS_CHANGE': // 设备状态变更
            console.log('处理设备状态变更事件');
            handleDeviceStatusChange(eventData);
            break;
          default:
            console.log('未知事件类型:', eventData.eventType);
        }
      } else {
        console.log('事件数据格式异常:', eventData);
      }
      
      // 返回成功响应
      return res.json({
        code: 0,
        message: 'success',
        eventId: eventRecord.timestamp,
        receivedAt: new Date().toISOString()
      });
    }

    // HEAD请求 - 用于健康检查
    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    // 其他请求方法
    console.log('不支持的请求方法:', req.method);
    return res.status(405).json({
      code: 405,
      message: 'Method Not Allowed',
      allowed: ['GET', 'POST', 'OPTIONS', 'HEAD']
    });

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    
    // 记录错误
    eventsLog.push({
      timestamp: new Date().toISOString(),
      type: 'ERROR',
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      code: 500,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// 事件处理函数
function handleVisitorArrival(eventData) {
  const visitorName = eventData.visitorName || '未知访客';
  const visitTime = eventData.visitTime || '未知时间';
  console.log(`📱 访客 ${visitorName} 在 ${visitTime} 到达`);
  
  // 这里可以添加业务逻辑，比如发送通知等
}

function handleVisitorLeave(eventData) {
  const visitorName = eventData.visitorName || '未知访客';
  const leaveTime = eventData.leaveTime || '未知时间';
  console.log(`🚪 访客 ${visitorName} 在 ${leaveTime} 离开`);
}

function handlePermissionGroupUpdate(eventData) {
  console.log('🔄 权限组已更新:', eventData);
  // 这里可以更新本地权限组缓存
}

function handleDeviceStatusChange(eventData) {
  const deviceId = eventData.deviceId || '未知设备';
  const status = eventData.status || '未知状态';
  console.log(`🔧 设备 ${deviceId} 状态变更为: ${status}`);
}

// 辅助函数：获取事件日志
function getEventsLog() {
  return eventsLog;
}