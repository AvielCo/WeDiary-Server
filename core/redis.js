const redis = require("redis");

const PORT = 6379;
const client = redis.createClient(PORT);

client.on("error", (error) => console.log(`[REDIS] error: ${error}`));
client.on("connect", () => console.log(`[REDIS] connected`));
client.on("ready", () => console.log("[REDIS] ready"));

module.exports = client;
