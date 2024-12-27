const cachedPlayer = await redisClient.get(`player:${userId}`)
if(cachedPlayer){
  await redisClient.set(`player:${userId}`, JSON.stringify({ userId, userName: cachedPlayer.userName, score, gameId }))
}