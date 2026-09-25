import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [explanationSong, setExplanationSong] = useState(null);

  const audioRef = useRef(new Audio());
  const synthIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const { showToast } = useToast();

  // Web Audio Synth for graceful fallback when remote audio URLs are restricted
  const playSynthesizerChords = useCallback((tempo = 120, energy = 0.7) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Chord frequencies based on energy and mood
      const chords = [
        [261.63, 329.63, 392.00], // C major
        [220.00, 261.63, 329.63], // A minor
        [174.61, 220.00, 261.63], // F major
        [196.00, 246.94, 293.66], // G major
      ];
      let step = 0;
      const intervalMs = Math.max(300, (60 / tempo) * 1000);

      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = setInterval(() => {
        if (!isPlaying) return;
        const chord = chords[step % chords.length];
        step++;

        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = energy > 0.6 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.04 * (volume || 0.8), ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + intervalMs / 1000);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + intervalMs / 1000);
        });
      }, intervalMs);
    } catch (e) {
      console.warn('Synth playback notice', e);
    }
  }, [isPlaying, volume]);

  const stopSynthesizer = useCallback(() => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  }, []);

  const playSong = useCallback((song, playlistQueue = []) => {
    if (!song) return;

    setCurrentSong(song);
    setIsPlaying(true);
    setProgress(0);

    if (playlistQueue.length > 0) {
      setQueue(playlistQueue);
      const idx = playlistQueue.findIndex((s) => s.id === song.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      setQueue([song]);
      setQueueIndex(0);
    }

    // Try HTML5 audio stream first
    const audio = audioRef.current;
    audio.pause();
    stopSynthesizer();

    if (song.audio_url) {
      audio.src = song.audio_url;
      audio.volume = isMuted ? 0 : volume;
      audio
        .play()
        .then(() => {
          // Playing stream smoothly
        })
        .catch((err) => {
          console.warn('Remote stream unavailable, using reactive synth playback fallback:', err.message);
          playSynthesizerChords(song.tempo || 120, song.energy || 0.7);
        });
    } else {
      playSynthesizerChords(song.tempo || 120, song.energy || 0.7);
    }

    // Record listening event in database
    api.recordHistory(song.id, 'play').catch(() => {});
  }, [volume, isMuted, playSynthesizerChords, stopSynthesizer]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      stopSynthesizer();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(true);
          playSynthesizerChords(currentSong.tempo, currentSong.energy);
        });
    }
  }, [currentSong, isPlaying, playSynthesizerChords, stopSynthesizer]);

  const playNext = useCallback(() => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      playSong(queue[nextIndex], queue);
    } else if (queue.length > 0) {
      // Loop to beginning
      setQueueIndex(0);
      playSong(queue[0], queue);
    }
  }, [queue, queueIndex, playSong]);

  const playPrevious = useCallback(() => {
    if (queue.length > 0 && queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      playSong(queue[prevIndex], queue);
    } else if (currentSong) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    }
  }, [queue, queueIndex, currentSong, playSong]);

  const setVolume = (val) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  };

  const seekTo = (fraction) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = fraction * audioRef.current.duration;
      setProgress(fraction);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      stopSynthesizer();
    };
  }, [playNext, stopSynthesizer]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        queueIndex,
        progress,
        duration,
        volume,
        isMuted,
        explanationSong,
        setExplanationSong,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        setVolume,
        toggleMute,
        seekTo,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}
