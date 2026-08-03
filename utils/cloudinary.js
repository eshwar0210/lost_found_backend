const cloudinary = require('cloudinary').v2;
const { v4: uuid } = require('uuid');

let configured = false;

const initCloudinary = () => {
  if (
    configured ||
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  configured = true;
};

const uploadBuffer = async (buffer, { folder, mimetype }) => {
  initCloudinary();
  const dataUri = `data:${mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: uuid(),
    resource_type: 'image',
  });
  return result.secure_url;
};

const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const uploadIdx = parts.lastIndexOf('upload');
    if (uploadIdx === -1) return null;
    let tail = parts.slice(uploadIdx + 1);
    if (tail.length && /^v\d+$/.test(tail[0])) tail = tail.slice(1);
    if (!tail.length) return null;
    const last = tail[tail.length - 1];
    tail[tail.length - 1] = last.replace(/\.[a-zA-Z0-9]+$/, '');
    return tail.join('/');
  } catch (error) {
    return null;
  }
};

const deleteImage = async (url) => {
  initCloudinary();
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = { cloudinary, initCloudinary, uploadBuffer, deleteImage, extractPublicId };
