import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import getVideoEmbed from '../utils/videoEmbed';

export default function LecturePlayerModal({ lecture, open, onClose }) {
  const { t } = useTranslation();
  if (!lecture) return null;

  const embed = getVideoEmbed(lecture.videoUrl || lecture.videoFileUrl);

  return (
    <Modal open={open} onClose={onClose} title={lecture.title} size="xl">
      <div className="space-y-4">
        {embed ? (
          <div className="overflow-hidden rounded-2xl bg-black">
            {embed.type === 'video' ? (
              <video
                className="aspect-video w-full"
                src={embed.src}
                controls
                playsInline
                controlsList="nodownload"
              >
                <track kind="captions" />
              </video>
            ) : (
              <iframe
                className="aspect-video w-full"
                src={embed.src}
                title={lecture.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl bg-[var(--ce-bg)] text-sm text-[var(--ce-muted)]">
            {t('student.lectureNoVideo')}
          </div>
        )}
        {lecture.description && (
          <p className="text-sm leading-relaxed text-[var(--ce-muted)]">{lecture.description}</p>
        )}
      </div>
    </Modal>
  );
}
