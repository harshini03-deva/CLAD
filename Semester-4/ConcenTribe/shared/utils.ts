// Helper function to estimate reading time based on content length
export const estimateReadingTime = (text: string): number => {
  if (!text) return 1;
  // Average reading speed: 200 words per minute
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};
