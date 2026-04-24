export const ORDER_QUEUE = 'orders';
export const ORDER_CONFIRMATION_JOB = 'order.confirmation';
export const ORDER_STATUS_UPDATE_JOB = 'order.status-update'

export interface OrderConfirmationPayload{
    orderId: string;
    userEmail: string
}

export interface OrderStatusUpdatePayload{
    orderId: string;
    userEmail: string;
    oldStatus: string;
}