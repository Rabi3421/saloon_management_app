/**
 * App-level configuration loaded from .env at build time.
 *
 * This app is deployed per-salon. Each salon gets its own build with its own
 * .env file that contains the correct SALON_ID. All API calls automatically
 * scope to that salon — the same codebase serves every salon, only the .env
 * changes between deployments.
 *
 * .env keys:
 *   API_BASE_URL  – backend base URL (e.g. https://api.salonos.com)
 *   SALON_ID      – the unique ID of the salon this build belongs to
 */
import { API_BASE_URL, SALON_ID as ENV_SALON_ID } from '@env';

/** Backend base URL read from .env */
export const BASE_URL: string = API_BASE_URL;

/**
 * The salon this app instance belongs to.
 * Set once at build time via .env — never changes at runtime.
 */
export const SALON_ID: string = ENV_SALON_ID;
