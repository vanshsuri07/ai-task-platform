import redisClient from '../config/redis.js';

export const pushToQueue = async (queueName, jobId) => {
  try {
    await redisClient.lPush(queueName, jobId.toString());
    console.log(`Pushed job ${jobId} to queue ${queueName}`);
  } catch (error) {
    console.error('Error pushing to queue:', error);
  }
};
