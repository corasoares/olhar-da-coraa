import { Lesson } from '@/types/learning';

interface FormatRendererProps {
  lesson: Lesson;
}

export function FormatRenderer({ lesson }: FormatRendererProps) {
  if (!lesson.format) return null;

  switch (lesson.format) {
    case 'image':
      return lesson.media_url ? (
        <div className="w-full">
          <img 
            src={lesson.media_url} 
            alt={lesson.title}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      ) : null;

    case 'text':
      return lesson.content ? (
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      ) : null;

    case 'video':
      if (lesson.youtube_url) {
        const videoId = lesson.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
        return videoId ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null;
      }
      return lesson.media_url ? (
        <video 
          src={lesson.media_url}
          controls
          className="w-full rounded-lg shadow-md"
        >
          Seu navegador não suporta a tag de vídeo.
        </video>
      ) : null;

    case 'pdf':
      return lesson.media_url ? (
        <embed
          src={lesson.media_url}
          type="application/pdf"
          className="w-full h-[600px] rounded-lg shadow-md"
        />
      ) : null;

    case 'audio':
      return lesson.media_url ? (
        <audio 
          src={lesson.media_url}
          controls
          className="w-full"
        >
          Seu navegador não suporta o elemento de áudio.
        </audio>
      ) : null;

    default:
      return null;
  }
}
