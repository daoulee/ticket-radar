const encoder = new TextEncoder();
const validSecret = (secret: string) => /^[A-Za-z0-9_-]{43,128}$/.test(secret);
const validIp = (ip: string) => /^[0-9a-f:.]{2,45}$/i.test(ip);
const message = (ip: string, timestamp: string, method: string, path: string) => `${ip}\n${timestamp}\n${method}\n${path}`;

/** Authenticates an edge proxy's client address; secret never reaches a browser. */
export async function signProxyClient(secret: string, ip: string, timestamp: string, method: string, path: string): Promise<string> {
  if (!validSecret(secret) || !validIp(ip) || !/^\d{13}$/.test(timestamp) || !/^[A-Z]{3,8}$/.test(method) || !path.startsWith('/') || path.length > 2048 || /[\r\n]/.test(path)) throw new Error('Invalid proxy identity');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message(ip, timestamp, method, path)));
  return [...new Uint8Array(signature)].map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function verifyProxyClient(secret: string, ip: string, timestamp: string, method: string, path: string, signature: string, now = Date.now()): Promise<boolean> {
  if (!validSecret(secret) || !validIp(ip) || !/^\d{13}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 60_000 || !/^[A-Z]{3,8}$/.test(method) || !path.startsWith('/') || path.length > 2048 || /[\r\n]/.test(path) || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const bytes = new Uint8Array(signature.match(/../g)!.map(x => parseInt(x, 16)));
  return crypto.subtle.verify('HMAC', key, bytes, encoder.encode(message(ip, timestamp, method, path)));
}
