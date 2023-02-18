import {ConnectionOptions} from "bullmq";
import IORedis from "ioredis";


let REDIS_HOST = process.env.REDIS_HOST;
let REDIS_PORT = process.env.REDIS_PORT;
let REDIS_PASS = process.env.REDIS_PASS;

// cache it to speed up perf
let redisConnection: IORedis | undefined;


const connectionMaker = async <ForBull = true>() => {
    if (redisConnection) {
        return redisConnection as ForBull extends true ? ConnectionOptions : IORedis;
    }


    if(typeof REDIS_HOST === "undefined") console.log("REDIS_HOST needs to be set.");
    if(typeof REDIS_PORT === "undefined") console.log("REDIS_PORT needs to be set.");
    if(typeof REDIS_PASS === "undefined") console.log("REDIS_PASS needs to be set.");

    redisConnection = new IORedis({
        host: REDIS_HOST,
        port: Number(REDIS_PORT),
        password: REDIS_PASS,
        maxRetriesPerRequest: null
    });
    return redisConnection as ForBull extends true ? ConnectionOptions : IORedis;
};

export default connectionMaker;
