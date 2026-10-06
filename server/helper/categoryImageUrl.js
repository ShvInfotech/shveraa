const getBackendDomain = (req) => {
  const configuredDomain = process.env.BACKEND_DOMIN_URL || process.env.BACKEND_DOMAIN;
  if (configuredDomain) return configuredDomain.replace(/\/$/, '');

  if (!req) return '';
  const proto = req.headers?.['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol) || 'https';
  const host = req.headers?.['x-forwarded-host'] || req.get?.('host') || '';

  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return '';
  }

  return `${proto}://${host}`.replace(/\/$/, '');
};

export const withCategoryImageUrl = (category, req) => {
  const categoryData = category.toObject ? category.toObject() : { ...category };
  const image = categoryData.image;

  if (image && !/^https?:\/\//i.test(image)) {
    const domain = getBackendDomain(req);
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    categoryData.image = domain ? `${domain}${cleanPath}` : cleanPath;
  }

  return categoryData;
};