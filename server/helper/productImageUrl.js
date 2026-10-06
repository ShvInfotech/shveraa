const getBackendDomain = (req) => {
  const configuredDomain = process.env.BACKEND_DOMIN_URL || process.env.BACKEND_DOMAIN;
  if (configuredDomain) return configuredDomain.replace(/\/$/, '');

  if (!req) return '';
  const proto = req.headers?.['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol) || 'https';
  const host = req.headers?.['x-forwarded-host'] || req.get?.('host') || '';

  // If host is localhost/loopback behind a reverse proxy, return empty string so images use relative paths (/uploads/...)
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return '';
  }

  return `${proto}://${host}`.replace(/\/$/, '');
};

const withImageUrl = (image, req) => {
  if (!image || /^https?:\/\//i.test(image) || image.startsWith('data:')) return image;
  const domain = getBackendDomain(req);
  const cleanPath = image.startsWith('/') ? image : `/${image}`;
  return domain ? `${domain}${cleanPath}` : cleanPath;
};

// Product image paths stay relative in MongoDB.  Only API responses receive
// the backend domain, matching the category-image API behaviour.
export const withProductImageUrls = (product, req) => {
  const productData = product.toObject ? product.toObject() : { ...product };
  if (Array.isArray(productData.images)) {
    productData.images = productData.images.map((img) => withImageUrl(img, req));
  }
  if (productData.image) {
    productData.image = withImageUrl(productData.image, req);
  }
  productData.variants = (productData.variants || []).map((variant) => ({
    ...variant,
    images: (variant.images || []).map((image) => withImageUrl(image, req)),
  }));

  return productData;
};

// The editor receives fully-qualified URLs in API responses. Convert this
// application's /uploads URL back to the relative path before persisting it.
export const toStoredProductImagePath = (image) => {
  if (typeof image !== 'string' || !image.trim()) return '';
  const value = image.trim();

  if (value.startsWith('data:')) {
    throw new Error('Base64 product images are not supported. Upload an image file instead.');
  }

  try {
    const url = new URL(value);
    return url.pathname.startsWith('/uploads/') ? url.pathname : value;
  } catch {
    return value;
  }
};

export const toStoredProductImagePaths = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map(toStoredProductImagePath).filter(Boolean);
};
