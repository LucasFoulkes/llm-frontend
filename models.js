const models = {
  0: "gemini-3.1-pro-preview", // Chat (strong reasoning)
  1: "gemini-3-flash-preview", // Chat (fast thinking)
  2: "gemini-3.1-flash-lite-preview", // Chat (fast + cheap)
  3: "gemini-2.5-pro", // Gemini 2.5 chat
  4: "gemini-2.5-flash", // Gemini 2.5 chat
  5: "gemini-2.5-flash-lite", // Gemini 2.5 chat lite
  6: "gemini-3.1-flash-image-preview", // Vision/image
  7: "gemini-3-pro-image-preview", // Vision/image
  8: "gemini-2.5-flash-image", // Vision/image
  9: "gemini-3.1-flash-live-preview", // Live/audio
  10: "gemini-2.5-flash-native-audio-preview-12-2025", // Live/audio
  11: "gemini-2.5-pro-preview-tts", // TTS
  12: "gemini-2.5-flash-preview-tts", // TTS
  13: "deep-research-pro-preview-12-2025", // Agent/research
  14: "gemini-2.5-computer-use-preview-10-2025", // Agent/research
  15: "gemini-embedding-2-preview", // Retrieval/embedding
  16: "gemini-embedding-001", // Retrieval/embedding
  17: "gemini-robotics-er-1.5-preview", // Robotics
  18: "veo-3.1-generate-preview", // Audio/music generation
  19: "lyria-realtime-exp", // Audio/music generation
  20: "lyria-3-pro-preview", // Audio/music generation
  21: "lyria-3-clip-preview", // Audio/music generation
};

module.exports = { models };
