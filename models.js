const models = {
  // Stable models
  0: "gemini-2.5-flash", // Price: Input $0.30/1M (text,image,video), $1.00/1M (audio); Output $2.50/1M
  1: "gemini-2.5-flash-lite", // Price: Input $0.10/1M (text,image,video), $0.30/1M (audio); Output $0.40/1M
  2: "gemini-2.5-pro", // Price: Input $1.25/1M (<=200k), $2.50/1M (>200k); Output $10.00/1M (<=200k), $15.00/1M (>200k)
  // Preview
  3: "gemini-3.1-pro-preview", // Price: Input $2.00/1M (<=200k), $4.00/1M (>200k); Output $12.00/1M (<=200k), $18.00/1M (>200k)
  4: "gemini-3-flash-preview", // Price: Input $0.50/1M (text,image,video), $1.00/1M (audio); Output $3.00/1M
  5: "gemini-3.1-flash-lite-preview", // Price: Input $0.25/1M (text,image,video), $0.50/1M (audio); Output $1.50/1M
  6: "gemini-2.5-pro-preview-tts", // Price: Input $1.00/1M text; Output $20.00/1M audio
  7: "gemini-2.5-flash-native-audio-preview-12-2025", // Price: Input $0.50/1M text, $3.00/1M (audio,video); Output $2.00/1M text, $12.00/1M audio
  8: "gemini-2.5-flash-preview-tts", // Price: Input $0.50/1M text; Output $10.00/1M audio
  // Generative media / multimodal
  9: "gemini-3.1-flash-live-preview", // Price: Input $0.75/1M text, $3.00 or $0.005/min (audio), $1.00 or $0.002/min (image,video); Output $4.50/1M text, $12.00 or $0.018/min (audio)
  10: "gemini-3.1-flash-image-preview", // Price: Input $0.50/1M (text,image); Output $3/1M text+thinking and $60/1M image-equivalent
  11: "gemini-2.5-flash-image", // Price: Input $0.30/1M (text,image); Output $0.039 per image (equiv. $30/1M)
  12: "gemini-3-pro-image-preview", // Price: Input $2.00/1M (text,image); Output $12/1M text+thinking and $120/1M images
  13: "deep-research-pro-preview-12-2025", // Price: Not publicly listed in official Gemini API pricing page; external references report Input $2.00/1M, Output $12.00/1M
  14: "gemini-2.5-computer-use-preview-10-2025", // Price: Not publicly listed in current Gemini API docs page
  15: "gemini-embedding-2-preview", // Price: Not listed in main Gemini pricing page (public docs); older references show embedding text/image/video/audio pricing
  16: "gemini-embedding-001", // Price: Not listed in main Gemini pricing page (public docs)
  17: "gemini-robotics-er-1.5-preview", // Price: Not publicly listed in main Gemini pricing page (public docs)
  18: "veo-3.1-generate-preview", // Price: Billing is per second: $0.40/1s (720p/1080p), $0.60/1s (4k) for standard; $0.15/1s (720p/1080p), $0.35/1s (4k) for fast
  19: "lyria-realtime-exp", // Price: No published pricing table in current docs; previously described as experimental/free in some references
  20: "lyria-3-pro-preview", // Price: No public API pricing table entry found
  21: "lyria-3-clip-preview", // Price: No public API pricing table entry found
};

module.exports = { models };

