const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("Redis connection URL is not configured");
}

const parsedUrl = new URL(redisUrl);

export const redisConnection = {
  host: parsedUrl.hostname,
  port: parsedUrl.port ? Number(parsedUrl.port) : 6379,
  username: parsedUrl.username ? decodeURIComponent(parsedUrl.username) : 'default',
  password: parsedUrl.password ? decodeURIComponent(parsedUrl.password) : undefined,
  tls: {}, 
};

console.log(`Configured Redis connection for host: ${redisConnection.host}`);
