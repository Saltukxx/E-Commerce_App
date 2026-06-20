export const INQUIRY_STATUS = {
  PENDING: 'pending',
  QUOTED: 'quoted',
  CLOSED: 'closed',
} as const;

export type InquiryStatus = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];
