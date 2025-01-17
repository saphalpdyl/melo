export const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_SERVER || "http://localhost:1999"

// Misc
export const REDIRECT_LOGIN_PAGE_URL = process.env.REDIRECT_LOGIN_PAGE_URL || "/auth/sign-in/"
export const REDIRECT_SIGNUP_PAGE_URL = process.env.REDIRECT_SIGNUP_PAGE_URL || "/auth/sign-up/"
export const DASHBOARD_PAGE_URL = process.env.DASHBOARD_PAGE_URL || "/dashboard/"

// Firebase
export const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
export const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
export const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
export const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
export const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID