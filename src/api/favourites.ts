import apiClient from './client';

export interface FavouriteSalon {
  _id: string;
  salonId: string;
  salonName?: string;
  name?: string;
  address?: string;
  image?: string;
  rating?: number;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400';

export async function getFavourites(): Promise<FavouriteSalon[]> {
  const res = await apiClient.get('/api/user/favourites');
  const data = res.data.data || [];
  return (Array.isArray(data) ? data : []).map((item: any) => {
    const salon = typeof item.salonId === 'object' ? item.salonId : null;
    const salonId = salon?._id ?? item.salonId ?? item._id;
    return {
      _id: String(item._id ?? salonId),
      salonId: String(salonId),
      salonName: salon?.name ?? item.salonName,
      name: salon?.name ?? item.name ?? item.salonName,
      address: salon?.address ?? item.address,
      image: salon?.images?.[0] ?? salon?.logo ?? item.image ?? PLACEHOLDER_IMAGE,
      rating: item.rating,
    };
  });
}

export async function addFavourite(targetSalonId: string): Promise<void> {
  await apiClient.post(`/api/user/favourites/${targetSalonId}`);
}

export async function removeFavourite(targetSalonId: string): Promise<void> {
  await apiClient.delete(`/api/user/favourites/${targetSalonId}`);
}
