import {matchMakingQueue} from './redisQueue'
import {redis} from './redisService'

export const cleanQueue = async () => {
    try {
        await matchMakingQueue.empty();
        console.log('Queue cleaned successfully');
    } catch (error) {
        console.error('Error cleaning queue:', error);
    }
};
const emptyAllRedisHashes = async () => {
    try {
      const keys = await redis.keys('*');
      const pipeline = redis.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
      console.log('All Redis hashes have been deleted');
    } catch (err) {
      console.error('Error emptying Redis hashes:', err);
    }
  };

cleanQueue()
emptyAllRedisHashes()
