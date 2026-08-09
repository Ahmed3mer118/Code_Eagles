import resolveMediaUrl from './mediaUrl';

function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/i);
  return match?.[1] || null;
}

function getVimeoId(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1] || null;
}

export function getVideoEmbed(url) {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return null;

  const youtubeId = getYouTubeId(resolved);
  if (youtubeId) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${youtubeId}?rel=0` };
  }

  const vimeoId = getVimeoId(resolved);
  if (vimeoId) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoId}` };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(resolved) || resolved.includes('/uploads/')) {
    return { type: 'video', src: resolved };
  }

  return { type: 'iframe', src: resolved };
}

export default getVideoEmbed;
