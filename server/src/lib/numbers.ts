export const formatSequenceNumber = (prefix: string, n: number) => {
  const num = Math.max(1, Math.floor(n));
  return `${prefix}-${String(num).padStart(4, '0')}`;
};

