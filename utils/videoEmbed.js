// Converts a YouTube/Vimeo watch/share link into an embeddable iframe src.
// Returns null if the URL isn't recognized (falls back to a plain link).
function toEmbedUrl(url) {
  if (!url) return null;

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

module.exports = { toEmbedUrl };
