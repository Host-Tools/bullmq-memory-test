import connectionMaker from "./connectionMaker";
import {Queue} from "bullmq";
import {queueNames} from "./constant";


type QueueNames = typeof queueNames[number];


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



type QueueAlias<Data> = Queue<Data, any, QueueNames | JobName>;

type QueuesType = {
    [P in QueueNames]: P extends keyof QueueDataType
        ? QueueAlias<QueueDataType[P]>
        : QueueAlias<any>;
};


let allQueues: QueuesType | undefined;

const getAllQueues = async () => {
    if (allQueues) {
        return allQueues;
    }
    const connection = await connectionMaker();
    const queues = {} as QueuesType;
    for (let i = 0; i < queueNames.length; i += 1) {
        const name = queueNames[i];
        console.log("Loading queue:", name);
        const queue = new Queue<any, any, QueueNames>(name, {
            connection
        });
        queues[name] = queue;
    }
    allQueues = queues;
    return allQueues;
};



export default async () => {
    const queues = await getAllQueues();
    const names = Object.keys(queues);
    for (let i = 0; i < names.length; i += 1) {
        const name = names[i];
        const queue = queues[name];

        queue.add(name, {}, {});
    }

    return queues;
};
