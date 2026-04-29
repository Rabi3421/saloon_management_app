// Central export point for all API modules
export * from './auth';
export * from './services';
export * from './staff';
export * from './bookings';
export * from './user';
export { getPublicSalonInfo, type SalonInfo, type PublicService, type PublicStaff } from './public';
export * from './passwordReset';
export * from './reviews';
export * from './paymentMethods';
export * from './favourites';
export * from './notifications';
export * from './messages';
export {
	getOwnerPromotions,
	getPublicPromotions,
	createPromotion,
	updatePromotion,
	deletePromotion,
	type Promotion,
	type PromotionPayload,
	type PromotionService,
} from './promotions';
export { default as apiClient } from './client';
