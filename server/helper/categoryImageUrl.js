const getBackendDomain = (req) => {
  const configuredDomain = process.env.BACKEND_DOMIN_URL || process.env.BACKEND_DOMAIN;
  return (configuredDomain || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
};

export const withCategoryImageUrl = (category, req) => {
  const categoryData = category.toObject ? category.toObject() : { ...category };
  const image = categoryData.image;

  if (image && !/^https?:\/\//i.test(image)) {
    categoryData.image = `${getBackendDomain(req)}/${image.replace(/^\//, '')}`;
  }

  return categoryData;
};