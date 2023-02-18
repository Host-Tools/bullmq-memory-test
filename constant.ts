
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