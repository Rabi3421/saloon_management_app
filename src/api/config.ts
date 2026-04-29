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
import { Platform } from 'react-native';

function resolveBaseUrl(url: string): string {
	if (Platform.OS !== 'android') return url;

	return url
		.replace('http://localhost:', 'http://10.0.2.2:')
		.replace('https://localhost:', 'https://10.0.2.2:')
		.replace('http://127.0.0.1:', 'http://10.0.2.2:')
		.replace('https://127.0.0.1:', 'https://10.0.2.2:');
}

/** Backend base URL read from .env */
export const BASE_URL: string = resolveBaseUrl(API_BASE_URL);

/**
 * The salon this app instance belongs to.
 * Set once at build time via .env — never changes at runtime.
 */
export const SALON_ID: string = ENV_SALON_ID;
