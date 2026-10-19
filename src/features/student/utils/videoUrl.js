// src/features/student/utils/videoUrl.js

/**
 * يبني URL كامل للفيديو أو الصورة
 * - لو الـ URL كامل (http/https) → يرجعه زي ما هو
 * - لو بيبدأ بـ / → يضيف الـ origin
 * - لو اسم ملف بس → يضيف /uploads/
 */
export function resolveMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  const trimmed = rawUrl.trim();

  // URL كامل
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // الـ origin من البيئة
  const ORIGIN =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // بيبدأ بـ /
  if (trimmed.startsWith('/')) {
    // لو المسار أصلاً فيه /uploads أو /api، استخدمه زي ما هو
    return `${ORIGIN}${trimmed}`;
  }

  // اسم ملف بس → /uploads/
  return `${ORIGIN}/uploads/${trimmed}`;
}

/**
 * يبني URL للفيديو من حقل محتمل يكون object أو string
 */
export function getVideoUrl(lecture) {
  if (!lecture) return '';

  // جرّب كل الحقول المحتملة
  const candidates = [
    lecture.videoUrl,
    lecture.lectureUrl,
    lecture.url,
    lecture.video?.url,
    lecture.video?.secureUrl,
    lecture.media?.url,
    lecture.media?.videoUrl,
  ];

  for (const c of candidates) {
    if (c) {
      const resolved = resolveMediaUrl(c);
      if (resolved) return resolved;
    }
  }

  return '';
}

/**
 * يبني URL للـ thumbnail
 */
export function getThumbnailUrl(lecture) {
  if (!lecture) return '';

  const candidates = [
    lecture.thumbnailUrl,
    lecture.thumbnail,
    lecture.thumb,
    lecture.poster,
    lecture.thumbnailImage,
  ];

  for (const c of candidates) {
    if (c) {
      const resolved = resolveMediaUrl(c);
      if (resolved) return resolved;
    }
  }

  return '';
}
