export const PROSPECT_STATUSES = ['NEW', 'QUALIFIED', 'MESSAGED', 'REPLIED', 'CALL_BOOKED', 'NOT_A_FIT', 'PARKED'] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

export const INTERACTION_TYPES = ['NOTE', 'MESSAGE_SENT', 'REPLY_RECEIVED', 'CALL', 'MEETING', 'OTHER'] as const;
export const INTERACTION_CHANNELS = ['LINKEDIN', 'EMAIL', 'PHONE', 'OTHER'] as const;
