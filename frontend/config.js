export const BASE_URL="http://localhost:8000"

export const getImageUrl = (imagePath) => {
  const cleanedPath = imagePath.replace(/^\.?\/?public[\\/]/, '');
  return `${BASE_URL}/${cleanedPath.replace(/\\/g, '/')}`;
};