import React, { useState, useRef, useEffect } from "react";
import logoUrl from "../assets/react.svg";

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function Audio({
  title = "Chưa có nguồn âm thanh",
  artist = "Undefined",
  coverArt = logoUrl,
  audioSrc = "",
  lyricsUrl = "",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [lyrics, setLyrics] = useState([]); // Changed to array of objects
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const audioRef = useRef(null);
  const lyricsRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      document.title = `${title} - ${artist}`;
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current.currentTime);
        updateLyrics(audioRef.current.currentTime);
      });
    }

    fetch(lyricsUrl)
      .then((response) => response.text())
      .then((text) => {
        const parsedLyrics = parseLRC(text);
        setLyrics(parsedLyrics);
      })
      .catch((error) => console.error("Error fetching lyrics:", error));
  }, [lyricsUrl, isPlaying]);

  const parseLRC = (lrc) => {
    const lines = lrc.split("\n");
    return lines
      .map((line) => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
        if (match) {
          const [, min, sec, ms, text] = match;
          return {
            time: parseInt(min) * 60 + parseInt(sec) + parseInt(ms) / 100,
            text: text.trim(),
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const updateLyrics = (currentTime) => {
    const index = lyrics.findIndex(
      (lyric, index) =>
        lyric.time <= currentTime &&
        (!lyrics[index + 1] || lyrics[index + 1].time > currentTime)
    );
    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index);
      if (lyricsRef.current && index !== -1) {
        const lyricElement = lyricsRef.current.children[index];
        lyricElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handlePrevious = () => {
    audioRef.current.currentTime = 0;
  };

  const handleNext = () => {
    // In a real app, this would load the next track
    audioRef.current.currentTime = 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="h-2 bg-red-900"></div>
      <div className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex p-4">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              className="w-full h-full object-cover rounded"
              src={coverArt}
              alt="Album Cover"
            />
          </div>
          <div className="ml-4 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-xl text-gray-800 font-medium">{title}</h3>
              <p className="text-sm text-gray-500">{artist}</p>
            </div>
            <div className="flex items-center">
              <button onClick={handlePrevious} className="text-gray-600 mr-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 5h3v10H4V5zm12 0v10l-9-5 9-5z" />
                </svg>
              </button>
              <button
                onClick={togglePlay}
                className="text-white p-2 rounded-full bg-orange-900 shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d={
                      isPlaying
                        ? "M5 4h3v12H5V4zm7 0h3v12h-3V4z"
                        : "M4 4l12 6-12 6z"
                    }
                  />
                </svg>
              </button>
              <button onClick={handleNext} className="text-gray-600 ml-4">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 5h3v10h-3V5zM4 5l9 5-9 5V5z" />
                </svg>
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`ml-auto text-${isLiked ? "red" : "gray"}-400`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="flex justify-between text-sm text-gray-600">
            <p>{formatTime(currentTime)}</p>
            <p>{formatTime(duration)}</p>
          </div>
          <div className="mt-1">
            <div
              className="h-1 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-1 bg-red-400 rounded-full relative"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <span className="w-3 h-3 bg-red-400 absolute right-0 bottom-0 -mb-1 rounded-full shadow"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 h-64 overflow-y-auto" ref={lyricsRef}>
          {lyrics.map((lyric, index) => (
            <p
              key={index}
              className={`transition-all duration-300 ${
                index === currentLyricIndex
                  ? "text-orange-900 font-bold text-lg"
                  : "text-gray-600 text-base"
              }`}
            >
              {lyric.text}
            </p>
          ))}
        </div>
      </div>
      <audio ref={audioRef} src={audioSrc} />
    </div>
  );
}
