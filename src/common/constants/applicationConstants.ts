export const APPLICATION_STATUS = {
  DRAFT: 0,
  PENDING: 1,
  SUBMITTED: 2,
  UNDER_REVIEW: 3,
  VERIFIED: 4,
  REJECTED: 5,
  PAYMENT_PENDING: 6,
  PENDING_APPROVAL: 7,
  APPROVED: 8
} as const

export const STATUS_TEXT: { [key: number]: string } = {
  0: 'Draft',
  1: 'Pending',
  2: 'Submitted',
  3: 'Under Review',
  4: 'Verified',
  5: 'Rejected',
  6: 'Payment Pending',
  7: 'Pending Approval',
  8: 'Approved'
}

export const STATUS_COLORS: { [key: number]: string } = {
  0: 'secondary',
  1: 'info',
  2: 'primary',
  3: 'warning',
  4: 'info',
  5: 'danger',
  6: 'warning',
  7: 'info',
  8: 'success'
}

export const TOAST_CONFIG = {
  VARIANTS: {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'info'
  },
  ICONS: {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  },
  DELAY: 4000
} as const