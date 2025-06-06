export const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  })
    .format(price)
    .replace("Rp", "Rp.");
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder-product.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
};
