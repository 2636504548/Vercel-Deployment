import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method === 'GET') {
    const { echostr } = request.query;
    if (echostr) {
      return response.send(echostr);
    }
    return response.json({ 
      status: 'ok', 
      service: 'HikVision Event',
      timestamp: new Date().toISOString()
    });
  }
  
  if (request.method === 'POST') {
    console.log('Event received:', request.body);
    return response.json({ code: 0, message: 'success' });
  }
  
  return response.status(405).json({ error: 'Method not allowed' });
}
