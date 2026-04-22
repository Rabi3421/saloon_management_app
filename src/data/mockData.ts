export interface Salon {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance: string;
  image: string;
  isOpen: boolean;
  isFavorite: boolean;
  about: string;
  email: string;
  phone: string;
  website: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
}

export interface ServiceItem {
  name: string;
  duration: string;
  price: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  items: ServiceItem[];
}

export interface WorkingHours {
  day: string;
  hours: string;
  isClosed: boolean;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Hair Cut', icon: '✂️', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: '2', name: 'Shaves', icon: '🪒', color: '#6C3FC5', bgColor: '#EDE9FE' },
  { id: '3', name: 'Makeup', icon: '💄', color: '#F97316', bgColor: '#FFEDD5' },
  { id: '4', name: 'Nail Cut', icon: '💅', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: '5', name: 'Hair Color', icon: '🎨', color: '#3B82F6', bgColor: '#DBEAFE' },
];

export const SALONS: Salon[] = [
  {
    id: '1',
    name: 'Serenity Salon',
    address: '8502 Preston Rd. Inglewood, Maine 98380',
    rating: 4.9,
    reviews: 76,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    isOpen: true,
    isFavorite: false,
    about:
      'Pellentesque egestas sit tincidunt porta leo the conse ctetur. At nisl semper urna vitae sed is vehicula. Pu rus dis at nibh quis. Convallis od io semper urna vitae sed vehicula.',
    email: 'ibnerieadasz@gmail.cm',
    phone: '+1235 32645 23564',
    website: 'www.riead.com',
  },
  {
    id: '2',
    name: 'Uptown Hair',
    address: '2464 Royal Ln. Mesa, New Jerscas...',
    rating: 4.9,
    reviews: 27,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    isOpen: true,
    isFavorite: true,
    about: 'A premium hair salon offering cutting-edge styles and treatments.',
    email: 'uptown@hair.com',
    phone: '+1234 56789',
    website: 'www.uptownhair.com',
  },
  {
    id: '3',
    name: 'Braids & Layers',
    address: '2464 Royal Ln. Mesa, New ...',
    rating: 4.9,
    reviews: 36,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
    isOpen: true,
    isFavorite: false,
    about: 'Specialists in braiding and layered haircuts.',
    email: 'braids@layers.com',
    phone: '+1234 99999',
    website: 'www.braidsandlayers.com',
  },
  {
    id: '4',
    name: 'The Cleanup',
    address: '2464 Royal Ln. Mesa, New ...',
    rating: 4.9,
    reviews: 36,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
    isOpen: true,
    isFavorite: false,
    about: 'Classic barbershop with a modern twist.',
    email: 'cleanup@salon.com',
    phone: '+1234 11111',
    website: 'www.thecleanup.com',
  },
  {
    id: '5',
    name: 'Fashion Forward',
    address: '2464 Royal Ln. Mesa, New ...',
    rating: 4.9,
    reviews: 36,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400',
    isOpen: true,
    isFavorite: true,
    about: 'Trendsetting salon for the fashion-forward individual.',
    email: 'fashion@forward.com',
    phone: '+1234 22222',
    website: 'www.fashionforward.com',
  },
  {
    id: '6',
    name: 'Hair Parlour',
    address: '2464 Royal Ln. Mesa, New ...',
    rating: 4.9,
    reviews: 36,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    isOpen: false,
    isFavorite: false,
    about: 'Your neighbourhood go-to hair parlour.',
    email: 'hair@parlour.com',
    phone: '+1234 33333',
    website: 'www.hairparlour.com',
  },
  {
    id: '7',
    name: 'Classique Curls',
    address: '2464 Royal Ln. Mesa, New ...',
    rating: 4.9,
    reviews: 36,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    isOpen: true,
    isFavorite: true,
    about: 'Specializing in curly and coily hair textures.',
    email: 'classique@curls.com',
    phone: '+1234 44444',
    website: 'www.classiquecurls.com',
  },
  {
    id: '8',
    name: 'Curls & More',
    address: '2464 Royal Ln. Mesa, New Jerscas...',
    rating: 4.9,
    reviews: 27,
    distance: '5 km',
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400',
    isOpen: true,
    isFavorite: false,
    about: 'Expert stylists for all curl types.',
    email: 'curls@more.com',
    phone: '+1234 55555',
    website: 'www.curlsandmore.com',
  },
];

export const SALON_STAFF: Staff[] = [
  { id: '1', name: 'Cameron Williamson', role: 'Barbers', rating: 5.0, avatar: 'CW' },
  { id: '2', name: 'Cody Fisher', role: 'Barbers', rating: 4.9, avatar: 'CF' },
  { id: '3', name: 'Arlene McCoy', role: 'Barbers', rating: 4.9, avatar: 'AM' },
];

export const SALON_SERVICES: ServiceCategory[] = [
  {
    id: '1',
    name: 'Hair Cut',
    items: [
      { name: 'Short', duration: '20 min', price: 30 },
      { name: 'Medium', duration: '20 min', price: 35 },
      { name: 'Tuner', duration: '20 min', price: 40 },
      { name: 'Special', duration: '20 min', price: 50 },
    ],
  },
  { id: '2', name: 'Beard', items: [{ name: 'Trim', duration: '15 min', price: 20 }, { name: 'Shape', duration: '20 min', price: 25 }] },
  { id: '3', name: 'Facials', items: [{ name: 'Basic', duration: '30 min', price: 45 }, { name: 'Premium', duration: '45 min', price: 70 }] },
  { id: '4', name: 'Hair Color', items: [{ name: 'Single', duration: '60 min', price: 80 }, { name: 'Highlights', duration: '90 min', price: 120 }] },
  { id: '5', name: 'Manicure', items: [{ name: 'Basic', duration: '30 min', price: 25 }, { name: 'Gel', duration: '45 min', price: 40 }] },
  { id: '6', name: 'Pedicure', items: [{ name: 'Basic', duration: '30 min', price: 30 }, { name: 'Spa', duration: '50 min', price: 55 }] },
  { id: '7', name: 'Waxing', items: [{ name: 'Eyebrows', duration: '15 min', price: 15 }, { name: 'Full Arms', duration: '30 min', price: 35 }] },
  { id: '8', name: 'Massage', items: [{ name: 'Head', duration: '20 min', price: 30 }, { name: 'Full Body', duration: '60 min', price: 90 }] },
  { id: '9', name: 'Makeup', items: [{ name: 'Natural', duration: '30 min', price: 50 }, { name: 'Bridal', duration: '90 min', price: 150 }] },
];

export const WORKING_HOURS: WorkingHours[] = [
  { day: 'Monday', hours: '10:00 AM - 10:00 PM', isClosed: false },
  { day: 'Tuesday', hours: '10:00 AM - 10:00 PM', isClosed: false },
  { day: 'Wednesday', hours: '10:00 AM - 10:00 PM', isClosed: false },
  { day: 'Thursday', hours: '10:00 AM - 10:00 PM', isClosed: false },
  { day: 'Friday', hours: '10:00 AM - 10:00 PM', isClosed: false },
  { day: 'Saturday', hours: '', isClosed: true },
  { day: 'Sunday', hours: '10:00 AM - 10:00 PM', isClosed: false },
];

export const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300',
];

export const PROMO_BANNERS = [
  { id: '1', discount: '30% Off', title: 'Wedding Package', subtitle: 'Hair-styling & treatment', color: '#6C3FC5' },
  { id: '2', discount: '20% Off', title: 'Weekend Special', subtitle: 'Nail & makeup combo', color: '#EC4899' },
];
