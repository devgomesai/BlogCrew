"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type SpeechRecognitionState = "idle" | "listening" | "error" | "unsupported";

interface UseSpeechRecognitionReturn {
  state: SpeechRecognitionState;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useSpeechRecognition(
  onResult: (transcript: string) => void
): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechRecognitionState>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  const SpeechRecognitionAPI =
    (typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null;

  const isSupported = SpeechRecognitionAPI !== null;

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setState("idle");
    finalTranscriptRef.current = "";
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setState("unsupported");
      return;
    }

    stop();

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) {
        onResult(finalTranscriptRef.current + interim);
      } else if (finalTranscriptRef.current) {
        onResult(finalTranscriptRef.current);
      }
    };

    recognition.onerror = () => {
      setState("error");
      finalTranscriptRef.current = "";
    };

    recognition.onend = () => {
      if (state === "listening") {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";
    setState("listening");
    recognition.start();
  }, [SpeechRecognitionAPI, onResult, stop, state]);

  const toggle = useCallback(() => {
    if (state === "listening") {
      const final = finalTranscriptRef.current;
      stop();
      if (final) {
        onResult(final);
      }
    } else {
      start();
    }
  }, [state, stop, start, onResult]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { state, isSupported, start, stop, toggle };
}
