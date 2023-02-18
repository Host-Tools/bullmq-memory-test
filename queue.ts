import connectionMaker from "./connectionMaker";
import {JobsOptions, Queue} from "bullmq";

const queueNames = [
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
type QueueNames = typeof queueNames[number];

const secondInMs = 1000;
const minuteInMs = 60 * secondInMs;
const hourInMs = 60 * minuteInMs;
const dayInMs = 24 * hourInMs;

type AutoRunQueues = Extract<
    QueueNames,
    | "scheduleJobs"
    | "populateSubscriptionStatus"
    | "changeSubscriptionStatusTrialEnds"
    | "removePastPrices"
    | "checkForPreviouslyExpiredAccounts"
    | "getReservationChanges"
>;

const autoRunJobs = {
    scheduleJobs: {
        repeat: {
            every: hourInMs
        }
    },
    populateSubscriptionStatus: {
        repeat: {
            every: dayInMs
        }
    },
    changeSubscriptionStatusTrialEnds: {
        repeat: {
            every: hourInMs * 6
        }
    },
    removePastPrices: {
        repeat: {
            every: hourInMs
        }
    },
    checkForPreviouslyExpiredAccounts: {
        repeat: {
            every: hourInMs
        }
    },
    getReservationChanges: {
        repeat: {
            every: minuteInMs / 2
        }
    }
} satisfies Record<AutoRunQueues, JobsOptions>;

const defaultJobOptions: JobsOptions = {
    removeOnComplete: 1000,
    removeOnFail: 500,
    attempts: 14, // http://www.exponentialbackoffcalculator.com/
    backoff: {
        type: "exponential",
        delay: 1000
    }
};

// this one is used to map a function on `worker` service via the data
type JobName =
    | "updateListings"
    | "updateListing"
    | "updateLocks"
    | "updateLock"
    | "getLockEvents"
    | "sendMessage"
    | "downloadPricesDisabled"
    | "updatePrices"
    | "calculatePrices"
    | "removePastPrices"
    | "getReservationChanges"
    | "getNewReservations"
    | "getNewReservationsBackup"
    | "getAllReservations"
    | "updateReservation"
    | "updateReviews"
    | "downloadReservationsFromCalendarURL"
    | "checkinWithDatabase"
    | "updateTimeline"
    | "checkForFailingUpdates"
    | "checkForOrphanedJobs"
    | "checkForStaleReservations"
    | "checkTimelineForMissedMessages"
    | "sendFirstTrialEndingEmail"
    | "sendSecondTrialEndingEmail"
    | "sendTrialEndedEmail"
    | "sendCancellationPollEmail"
    | "sendCancellationPollReminderEmail"
    | "sendTrialEndedPollEmail"
    | "sendTrialEndedPollReminderEmail"
    | "updateListingCountForBilling"
    | "populateSubscriptionStatus"
    | "checkForPreviouslyExpiredAccounts"
    | "changeSubscriptionStatusTrialEnds"
    | "loggedOutReminder"
    | "checkAccountForMissingEventBasedMessages"
    | "sendPushNotification"
    | "webhookAirbnb"
    | "webhookBooking"
    | "webhookHoufy"
    | "scheduleJobs"
    | "getReservationChangesFromMessages"
    | "getAccountReservations"
    | "getAccountThreads"
    | "getListingReservations";

// type ExcludeChannelQueues<T> = T extends
//     | `${infer A}Airbnb`
//     | `${infer B}Booking`
//     | `${infer H}HomeAway`
//     | `${infer H}Houfy`
//     ? never
//     : T;

type Values<T> = T[keyof T];

type SendPushNotification = {
    userID: string | string[];
    message: string;
    title: string;
    reservation: {
        _id: string;
        listingID: string;
    };
};

type QueueDataType = {
    sendPushNotification: SendPushNotification;
    scheduleJobs:
        | {
              userID: string;
              accountID: string;
              listingID?: string;
              lockID?: string;
              runJobsImmediately?: boolean;
          }
        | Record<string, never>;
    getAccountReservationsAirbnb: {
        userID: string;
        accountID: string;
    };
    getAccountReservationsBooking: {
        userID: string;
        accountID: string;
    };
    getAccountReservationsHoufy: {
        userID: string;
        accountID: string;
    };
    getListingReservationsAirbnb: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    getListingReservationsHomeAway: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    getAccountThreadsAirbnb: {
        userID: string;
        accountID: string;
    };
    updateListingsAirbnb: {
        userID: string;
        accountID: string;
    };
    updateListingsBooking: {
        userID: string;
        accountID: string;
    };
    updateListingsHomeAway: {
        userID: string;
        accountID: string;
    };
    updateListingsHoufy: {
        userID: string;
        accountID: string;
    };
    updateListingAirbnb: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    updateListingHomeAway: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    updateListingHoufy: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    updatePrices: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    updateLocks: {
        userID: string;
        accountID: string;
    };
    updateLock: {
        userID: string;
        accountID: string;
        listingID?: string;
        lockID: string;
    };
    getLockEvents: {
        userID: string;
        accountID: string;
        listingID?: string;
        lockID: string;
    };
    getReservationChangesFromMessagesHomeAway: {
        accountID: string;
    };
    updateListingCountForBilling: {
        userID: string;
    };
    downloadReservationsFromCalendarURL: {
        listingID: string;
    };
    updateTimeline: {
        userID: string;
        listingID?: string;
        messageRuleID?: string;
        reservationID?: string;
    };
    checkAccountForMissingEventBasedMessages: {
        accountID: string;
        userID: string;
    };
    updateReviews: {
        listingID: string;
        accountID: string;
        userID: string;
    };
};

interface JobDataType extends QueueDataType {
    updateListing: {
        userID: string;
        accountID: string;
        listingID: string;
    };
    updateListings: {
        userID: string;
        accountID: string;
    };
    updateReservation: {
        reservationID: string;
        accountID: string;
        listingID: string;
    };
    sendCancellationPollEmail: {
        userID: string;
    };
    sendCancellationPollReminderEmail: {
        userID: string;
    };
    sendTrialEndedPollReminderEmail: {
        userID: string;
    };
    sendTrialEndedPollEmail: {
        userID: string;
    };
    loggedOutReminder: {
        userID: string;
        accountID: string;
    };
    sendMessage: {
        userID: string;
        accountID: string;
        listingID: string;
        messageRuleID: string;
        reservationID: string;
        timelineID?: string;
        sendDate: Date;
        isLastMinuteMessage: boolean;
        data?:
            | {
                  event: "checkinChanged" | "checkoutChanged";
                  airbnbStartDate: string;
                  airbnbNights: number;
              }
            | {event: "numberOfGuestsChanged"; airbnbNumberOfGuests: number}
            | {
                  event: "doorUnlocked";
              };
        sendNow?: boolean;
    };
    calculatePrices: {
        listingID: string;
    };
    sendNoAccountEmail: {
        userID: string;
    };
    sendFirstTrialEndingEmail: {
        userID: string;
    };
    sendSecondTrialEndingEmail: {
        userID: string;
    };
    sendTrialEndedEmail: {
        userID: string;
    };
    sendPushNotification: SendPushNotification;
    webhookAirbnb: {
        userID: string;
    };
    webhookBooking: {
        userID: string;
    };
    webhookHoufy: {
        userID: string;
    };
}

type QueueReturnType = {
    [P in QueueNames]: P extends keyof QueueDataType ? QueueDataType[P] : any;
};

type QueueAlias<Data> = Queue<Data, any, QueueNames | JobName>;

type QueuesType = {
    [P in QueueNames]: P extends keyof QueueDataType
        ? QueueAlias<QueueDataType[P]>
        : QueueAlias<any>;
};

type JobReturnType = {
    [P in JobName]: P extends keyof JobDataType ? JobDataType[P] : any;
};

type IsAny<T> = 0 extends 1 & T ? true : T;

interface Job<T extends QueueNames, J extends JobName = any> {
    name: T;
    jobName?: J;
    data?: IsAny<J> extends true ? QueueReturnType[T] : JobReturnType[J];
    options?: JobsOptions;
}

let allQueues: QueuesType | undefined;

const getAllQueues = async () => {
    if (allQueues) {
        return allQueues;
    }

    const connection = await connectionMaker();
    const queues = {} as QueuesType;
    for (let i = 0; i < queueNames.length; i += 1) {
        const name = queueNames[i];
        const queue = new Queue<any, any, QueueNames>(name, {
            connection,
            defaultJobOptions
        });

        queues[name] = queue;
    }

    allQueues = queues;

    return allQueues;
};

const getQueue = async <T extends QueueNames>(name: T) => {
    const queues = await getAllQueues();
    return queues[name] as QueuesType[T];
};

const addJobIdAsNameToOptions = (name: string, options: JobsOptions): JobsOptions => ({
    ...options,
    jobId: name
});

export default async () => {
    const queues = await getAllQueues();
    const names = Object.keys(autoRunJobs);
    for (let i = 0; i < names.length; i += 1) {
        const name = names[i];
        const options = autoRunJobs[name];
        const queue = queues[name];

        queue.add(name, {}, addJobIdAsNameToOptions(name, {...defaultJobOptions, ...options}));
    }

    return queues;
};
