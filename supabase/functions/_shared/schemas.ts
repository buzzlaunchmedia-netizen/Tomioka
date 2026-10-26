import { z } from 'npm:zod@3';
const https = z.string().url().max(2000).refine(v => v.startsWith('https://'), 'Use an HTTPS image URL.');
export const productSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(3).max(150), slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
  description: z.string().trim().min(10).max(10000), category: z.enum(['Apparel', 'Posters', 'Accessories']), price: z.number().positive().max(10000000),
  images: z.array(https).min(1).max(12), tags: z.array(z.string().trim().min(1).max(80)).max(30), keywords: z.array(z.string().trim().max(80)).max(30), sku: z.string().trim().max(80), published: z.boolean(),
  variants: z.array(z.object({ label: z.string().trim().min(1).max(100), price: z.number().positive().max(10000000), stock: z.number().int().min(0).max(1000000) })).min(1).max(50),
}).refine(p => new Set(p.variants.map(v => v.label)).size === p.variants.length, 'Option labels must be unique.');
export const settingsSchema = z.object({
  headline: z.string().min(3).max(90), subheading: z.string().min(10).max(300), announcement: z.string().max(140), logo: https,
  introEnabled: z.boolean(), introDuration: z.number().min(.8).max(2.2), supportEmail: z.union([z.literal(''), z.string().email()]),
  instagram: z.union([z.literal(''), https.refine(v => /^https:\/\/(www\.)?instagram\.com\//.test(v))]),
  whatsapp: z.string().regex(/^(\+?\d{10,15})?$/), deliveryFee: z.number().min(0).max(100000), domain: z.literal('https://tomiokastore.vercel.app'),
});
export const postSchema = z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(3).max(150), summary: z.string().trim().min(10).max(1000), body: z.string().trim().min(20).max(25000), published: z.boolean() });
export const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
export const orderSchema = z.object({
  name: z.string().trim().min(2).max(150), email: z.string().trim().email().max(254), phone: z.string().trim().regex(/^\+?[\d\s()-]{10,18}$/),
  state: z.string().refine(v => STATES.includes(v)), city: z.string().trim().min(2).max(150), address: z.string().trim().min(8).max(1000), notes: z.string().max(500).default(''),
});
export { z };
