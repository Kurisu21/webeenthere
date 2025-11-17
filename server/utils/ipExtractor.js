/**
 * Utility function to extract client IP address from request
 * Handles various proxy scenarios and headers
 */
function extractClientIP(req) {
  // Check for X-Forwarded-For header (most common in proxy/load balancer setups)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, the first one is the original client
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    // Filter out internal/private IPs and get the first public IP
    for (const ip of ips) {
      if (ip && !isPrivateIP(ip)) {
        return ip;
      }
    }
    // If all are private, return the first one
    if (ips.length > 0) {
      return ips[0];
    }
  }

  // Check for X-Real-IP header (used by some proxies)
  const xRealIP = req.headers['x-real-ip'];
  if (xRealIP && !isPrivateIP(xRealIP)) {
    return xRealIP;
  }

  // Check for CF-Connecting-IP (Cloudflare)
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Check for True-Client-IP (Akamai and others)
  const trueClientIP = req.headers['true-client-ip'];
  if (trueClientIP) {
    return trueClientIP;
  }

  // Fallback to Express req.ip (requires trust proxy to be enabled)
  if (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1') {
    return req.ip;
  }

  // Check connection remote address
  if (req.connection && req.connection.remoteAddress) {
    const addr = req.connection.remoteAddress;
    // Handle IPv6 mapped IPv4 addresses
    if (addr.startsWith('::ffff:')) {
      return addr.substring(7);
    }
    return addr;
  }

  // Check socket remote address
  if (req.socket && req.socket.remoteAddress) {
    const addr = req.socket.remoteAddress;
    if (addr.startsWith('::ffff:')) {
      return addr.substring(7);
    }
    return addr;
  }

  // Last resort fallback
  return 'unknown';
}

/**
 * Check if an IP address is private/internal
 */
function isPrivateIP(ip) {
  if (!ip) return false;
  
  // Remove IPv6 prefix if present
  const cleanIP = ip.replace('::ffff:', '');
  
  // IPv4 private ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (loopback)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^0\.0\.0\.0$/,             // 0.0.0.0
  ];

  // Check IPv4 private ranges
  for (const range of privateRanges) {
    if (range.test(cleanIP)) {
      return true;
    }
  }

  // IPv6 private ranges
  if (cleanIP.startsWith('::1') || cleanIP.startsWith('fe80:')) {
    return true;
  }

  return false;
}

module.exports = {
  extractClientIP,
  isPrivateIP
};










