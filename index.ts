import events from "events";

import makeQueues from "./queue";
import makeWorkers from "./worker";


events.EventEmitter.defaultMaxListeners = 110;

const start = async () => {
    try {
        await makeQueues();
        await makeWorkers();
        console.log("Started...");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

start();
