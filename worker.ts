import connectionMaker from "./connectionMaker";
import {AdvancedOptions, MetricsTime, Worker, WorkerOptions} from "bullmq";

export const secondInMs = 1000;
export const minuteInMs = 60 * secondInMs;
export const hourInMs = 60 * minuteInMs;

export const queueNames = [
    "checkinWithDatabase",
    "getNewReservationsBackup",
    "sendPushNotification",
    "webhookAirbnb",
    "webhookBooking",
    "webhookHoufy",
    "sendMessageAirbnb",
    "sendMessageHomeAway",
    "sendMessageHoufy",
    "sendMessageBooking",
    "sendMessageEmail",
    "sendMessageSMS",
    "getReservationChangesFromMessagesAirbnb", // unused
    "getReservationChangesFromMessagesHomeAway",
    "getReservationChangesFromMessagesBooking", // unused
    "getReservationChangesFromMessagesHoufy", // unused
    "getAccountReservationsAirbnb",
    "getAccountReservationsHomeAway", // unused
    "getAccountReservationsBooking", // unused
    "getAccountReservationsHoufy",
    "getAccountThreadsAirbnb",
    "getAccountThreadsHomeAway", // unused
    "getAccountThreadsBooking", // unused
    "getAccountThreadsHoufy", // unused
    "getListingReservationsAirbnb",
    "getListingReservationsBooking", // unused
    "getListingReservationsHomeAway",
    "getListingReservationsHoufy", // unused
    "updateReservationAirbnb",
    "updateReservationBooking",
    "updateReservationHomeAway",
    "updateReservationHoufy",
    // update listings group
    "updateListingsAirbnb",
    "updateListingsBooking",
    "updateListingsHomeAway",
    "updateListingsHoufy",
    // update listing group
    "updateListingAirbnb",
    "updateListingBooking", // unused
    "updateListingHomeAway",
    "updateListingHoufy",
    // update prices
    "updatePrices",
    "updateLocks",
    "updateLock",
    "getLockEvents",
    "updateListingCountForBilling",
    "downloadReservationsFromCalendarURL",
    "populateSubscriptionStatus",
    "changeSubscriptionStatusTrialEnds",
    "removePastPrices",
    "updateTimeline",
    "sendEmails",
    "checkAccountForMissingEventBasedMessages",
    "updateReviews",
    "checkForPreviouslyExpiredAccounts",
    "getReservationChanges",
    // this has its own local processor
    "scheduleJobs"
] as const;

export const defaultWorkerSettings: AdvancedOptions = {
    backoffStrategy: (attemptsMade: number | undefined) => {
        if (attemptsMade === undefined) {
            return 1 * hourInMs;
        }
        const backoff: number[] = [
            secondInMs,
            3 * secondInMs,
            6 * secondInMs,
            20 * secondInMs,
            30 * secondInMs,
            // 1 minute
            3 * minuteInMs,
            6 * minuteInMs,
            // 10 minutes
            20 * minuteInMs,
            30 * minuteInMs
            // 1 hour
        ];
        return backoff[attemptsMade] || 1 * hourInMs;
    }
};

export const defaultWorkerOptions: WorkerOptions = {
    autorun: true,
    concurrency: 200,
    metrics: {
        maxDataPoints: MetricsTime.TWO_WEEKS
    },
    maxStalledCount: 3,
    settings: defaultWorkerSettings
};

export default async () => {
    const connection = await connectionMaker();
    for (let i = 0; i < queueNames.length; i += 1) {
        const name = queueNames[i];

        const options = defaultWorkerOptions;
        const worker = new Worker<any, any, any>(
            name,
            // @ts-ignore
            (...params) => {
                const [job] = params;
                console.log("job", job.name);
            },
            {
                ...options,
                connection
            }
        );

        worker.on("error", e => {
            console.error(`Worker for queue ${name} ran into this error: ${e.message}`);
        });
    }
};
