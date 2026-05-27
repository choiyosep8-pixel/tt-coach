// 유튜브 URL → embed URL + video id 추출
const YT_RE = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youtubeThumbnailUrl(url: string | null | undefined): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
