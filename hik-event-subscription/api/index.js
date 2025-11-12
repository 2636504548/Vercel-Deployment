export default function handler(request, response) {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>海康互联事件订阅服务</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            margin-top: 50px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .status {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .endpoint {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            word-break: break-all;
            margin: 10px 0;
        }
        .test-buttons {
            display: flex;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        button:hover {
            background: #45a049;
        }
        .result {
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 海康互联事件订阅服务</h1>
        
        <div class="status">
            <h3>✅ 服务状态：运行正常</h3>
            <p>部署时间：${new Date().toLocaleString()}</p>
        </div>

        <h3>📡 事件订阅端点</h3>
        <div class="endpoint" id="endpointUrl">
            等待生成...
        </div>

        <h3>🧪 测试功能</h3>
        <div class="test-buttons">
            <button onclick="testGet()">测试 GET 请求</button>
            <button onclick="testPost()">测试 POST 请求</button>
            <button onclick="testVerification()">测试 URL 验证</button>
        </div>

        <div class="result" id="testResult"></div>

        <h3>📋 使用说明</h3>
        <ol>
            <li>复制上面的端点 URL</li>
            <li>登录海康开放平台</li>
            <li>进入应用管理 → 事件订阅</li>
            <li>将 URL 粘贴到"请求地址"字段</li>
            <li>选择需要订阅的事件类型</li>
            <li>保存配置</li>
        </ol>
    </div>

    <script>
        // 显示当前端点URL
        const currentUrl = window.location.origin + '/api/event';
        document.getElementById('endpointUrl').textContent = currentUrl;

        async function testGet() {
            showResult('正在测试 GET 请求...');
            try {
                const response = await fetch('/api/event');
                const data = await response.text();
                showResult(\`GET 测试成功！\n状态码: \${response.status}\n响应: \${data}\`);
            } catch (error) {
                showResult(\`GET 测试失败: \${error}\`);
            }
        }

        async function testPost() {
            showResult('正在测试 POST 请求...');
            try {
                const response = await fetch('/api/event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        eventType: 'VISITOR_ARRIVAL',
                        visitorName: '测试用户',
                        visitTime: new Date().toISOString(),
                        eventId: 'test-' + Date.now()
                    })
                });
                const data = await response.json();
                showResult(\`POST 测试成功！\n状态码: \${response.status}\n响应: \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult(\`POST 测试失败: \${error}\`);
            }
        }

        async function testVerification() {
            showResult('正在测试 URL 验证...');
            try {
                const response = await fetch('/api/event?signature=test&timestamp=123&nonce=456&echostr=789');
                const data = await response.text();
                showResult(\`URL 验证测试成功！\n状态码: \${response.status}\n响应: \${data}\`);
            } catch (error) {
                showResult(\`URL 验证测试失败: \${error}\`);
            }
        }

        function showResult(message) {
            const resultEl = document.getElementById('testResult');
            resultEl.style.display = 'block';
            resultEl.textContent = message;
        }

        // 页面加载后自动测试GET请求
        window.addEventListener('load', () => {
            setTimeout(testGet, 1000);
        });
    </script>
</body>
</html>
  `;
  
  response.status(200).send(html);
}
