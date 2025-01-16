export const escapeLikeString = (value: string) => {
  return value.replace(/[%_\\]/g, "\\$&");
};
