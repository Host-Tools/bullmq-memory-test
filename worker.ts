import connectionMaker from "./connectionMaker";
import {Worker} from "bullmq";
import {queueNames} from "./constant";

export default async () => {
    const connection = await connectionMaker();
    for (let i = 0; i < queueNames.length; i += 1) {
        const name = queueNames[i];
        console.log("Loading worker:", name);
        const worker = new Worker<any, any, any>(
            name,
            // @ts-ignore
            (...params) => {
                const [job] = params;
                console.log(new Date(), job.name);
            },
            {
                connection
            }
        );

        worker.on("error", e => {
            console.error(`Worker for queue ${name} ran into this error: ${e.message}`);
        });
    }
};
