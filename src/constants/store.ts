import type { StoreSettings } from '@/types/store';
export const SITE_ORIGIN = 'https://tomiokastore.vercel.app';
export const BRAND_LOGO = 'https://cdn-ai.onspace.ai/onspace/project/uploads/nvmMR683HKvkV2y6L9iQCn/file_0000000021f882119c9bc21dc4829e64.png';
export const DEFAULT_SETTINGS: StoreSettings = { headline: 'Your fandom.\nYour world.', subheading: 'Anime-inspired pieces for the way you live. Discover statement tees, wall-worthy art, and the little collectibles that mean a lot.', announcement: 'ANIME MERCH. EVERYDAY EXPRESSION.  /  NIGERIA, NATIONWIDE.', logo: BRAND_LOGO, introEnabled: true, introDuration: 1.6, supportEmail: '', instagram: '', whatsapp: '', deliveryFee: 0, domain: SITE_ORIGIN };
export const CATEGORIES = ['All merch', 'Apparel', 'Posters', 'Accessories'];
export const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
export const money = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
