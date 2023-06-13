const redis = require('redis')

const redisHost = process.env.REDIS_HOST || "localhost"
const redisPort = process.env.REDIS_PORT || "6379"
const redisClient = redis.createClient({
  url: `redis://${redisHost}:${redisPort}`
})
exports.redisClient = redisClient

const rateLimitMaxRequests = 10
const keyRateLimitMaxRequests = 30


async function rateLimit(req, res, next) {
    let tokenBucket
    const bucketKey = req?.user ? req.user.id : req.ip
    //console.log(bucketKey)
    try {   
        tokenBucket = await redisClient.hGetAll(bucketKey)
    } catch (e) {
        next()
        return
    }

    const rateLimitWindowMillis = 60000
    const maxRequests = req?.user ? keyRateLimitMaxRequests : rateLimitMaxRequests
    const rateLimitRefreshRate = maxRequests / rateLimitWindowMillis

    tokenBucket = {
        tokens: parseFloat(tokenBucket.tokens) || maxRequests,
        last: parseInt(tokenBucket.last) || Date.now()
    }
    

    const timestamp = Date.now()
    const ellapsedMillis = timestamp - tokenBucket.last
    tokenBucket.tokens += ellapsedMillis * rateLimitRefreshRate
    tokenBucket.tokens = Math.min(tokenBucket.tokens, maxRequests)
    tokenBucket.last = timestamp

    if (tokenBucket.tokens >= 1) {
        tokenBucket.tokens -= 1
        await redisClient.hSet(bucketKey, [
            ["tokens", tokenBucket.tokens],
            ["last", tokenBucket.last]
        ])
        next()
    } else {
        await redisClient.hSet(bucketKey, [
            ["tokens", tokenBucket.tokens],
            ["last", tokenBucket.last]
        ])
        res.status(429).send({
            error: "Too many requests per minute"
        })
    }
}
exports.rateLimit = rateLimit