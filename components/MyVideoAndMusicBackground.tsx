import { useEffect, useRef, useState } from 'react';

export function MyVideoAndMusicBackground() {
  // Usa un vídeo de fondo en bucle infinito de "/public/video/AnimatedWallpaper1.mp4"
  // Y un audio al azar de la carpeta "/public/music".
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Lista de archivos de música disponibles
  const musicFiles = [
    '/music/Alfonso-Digital_Master.m4a',
    '/music/Alfonso-Matrix_of_Time.m4a',
    '/music/Luis_Barrera-Rock_Número_36.m4a',
  ];

  useEffect(() => {
    // Selecciona un audio al azar al montar el componente
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    setCurrentAudio(musicFiles[randomIndex]);
  }, []);

  useEffect(() => {
    // Reproduce el audio automáticamente cuando se selecciona
    if (audioRef.current && currentAudio) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
  }, [currentAudio]);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-none">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/video/AnimatedWallpaper1.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        style={{ pointerEvents: 'none' }}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950/80" />
      {currentAudio && (
        <audio ref={audioRef} src={currentAudio} autoPlay loop style={{ display: 'none' }} />
      )}
    </div>
  );
}

// Iframe version
// const VideoBackground: React.FC = () => {
//   const [currentVideoId, setCurrentVideoId] = useState<string>('');

//   useEffect(() => {
//     const randomIndex = Math.floor(Math.random() * YOUTUBE_VIDEO_IDS.length);
//     setCurrentVideoId(YOUTUBE_VIDEO_IDS[randomIndex]);
//   }, []);

//   if (!currentVideoId) return null;

//   return (
//     <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-none">
//       <iframe
//         className="absolute top-0 left-0 w-full h-full object-cover"
//         src={getYouTubeEmbedUrl(currentVideoId)}
//         title="YouTube video player"
//         frameBorder="0"
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//         allowFullScreen
//         aria-hidden="true"
//         tabIndex={-1}
//         style={{ pointerEvents: 'none' }}
//       ></iframe>
//       <div className="absolute top-0 left-0 w-full h-full bg-slate-950/80" />
//     </div>
//   );
// };
