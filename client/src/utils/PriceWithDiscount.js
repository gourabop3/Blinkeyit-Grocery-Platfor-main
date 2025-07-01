export const pricewithDiscount = (price, dis = 0) => {
  const numericPrice = Number(price) || 0;
  const numericDiscount = Math.min(Math.max(Number(dis) || 0, 0), 100); // clamp 0-100

  const discountAmount = Math.ceil((numericPrice * numericDiscount) / 100);
  return numericPrice - discountAmount;
};