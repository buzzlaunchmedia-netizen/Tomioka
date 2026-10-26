import { db, checked } from './database.ts';
export async function uploadMedia(req: Request) {
  if (Number(req.headers.get('content-length')) > 5500000) throw new Error('Images must be under 5 MB.');
  const form = await req.formData(); const file = form.get('file');
  if (!(file instanceof File) || !file.size || file.size > 5242880) throw new Error('Choose an image under 5 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP';
  const ext = png ? 'png' : jpeg ? 'jpg' : webp ? 'webp' : '';
  const mime = png ? 'image/png' : jpeg ? 'image/jpeg' : webp ? 'image/webp' : '';
  if (!ext || file.type !== mime) throw new Error('Only valid PNG, JPEG and WebP images are supported. SVG is not accepted.');
  const path = `catalogue/${crypto.randomUUID()}.${ext}`;
  checked(await db.storage.from('store-media').upload(path, bytes, { contentType: mime, cacheControl: '31536000', upsert: false }));
  const { data } = db.storage.from('store-media').getPublicUrl(path);
  checked(await db.from('store_media').insert({ path, url: data.publicUrl, name: file.name.slice(0, 200) }));
  checked(await db.from('store_audit').insert({ action: 'media_uploaded', target: path }));
  return { url: data.publicUrl };
}
