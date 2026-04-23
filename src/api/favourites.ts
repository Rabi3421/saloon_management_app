import apiClient from './client';

export interface FavouriteSalon {
  _id: string;
  salonId: string;
  salonName?: string;
  name?: string;
  address?: string;
  image?: string;
}

export async function getFavourites(): Promise<FavouriteSalon[]> {
  const res = await apiClient.get('/api/user/favourites');
  return res.data.data || [];
}

export async function addFavourite(targetSalonId: string): Promise<void> {
  await apiClient.post(`/api/user/favourites/${targetSalonId}`);
}

export async function removeFavourite(targetSalonId: string): Promise<void> {
  await apiClient.delete(`/api/user/favourites/${targetSalonId}`);
}
