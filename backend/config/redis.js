import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect asynchronously (needed for Redis v4+)
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Initial Redis Connection Error:', err.message);
        console.log('API will remain functional but task queueing will fail.');
    }
};

connectRedis();

export default redisClient;
