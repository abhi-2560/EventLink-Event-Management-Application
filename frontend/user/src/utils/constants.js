export const ROUTES = {
  HOME: "/",
  EVENTS: "/events",
  EVENT_DETAILS: "/events/:id",
  REGISTER: "/register/:id",
  PAYMENT: "/payment/:registrationId",
  RECEIPT: "/receipt/:paymentId",
};

export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
};

export const APP_NAME = import.meta.env.VITE_APP_NAME;