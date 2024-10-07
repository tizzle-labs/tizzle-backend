package config

import (
	"os"
	"tizzle-backend/internal/services/elevenlabs"
)

func InitElevenLabs() *elevenlabs.ElevenLabService {
	cfg := elevenlabs.ElevenLabService{
		APIKey:  os.Getenv("ELEVEN_LABS_API_KEY"),
		VoiceID: os.Getenv("ELEVEN_LABS_VOICE_ID"),
		ModelID: os.Getenv("ELEVEN_LABS_MODEL_ID"),
	}

	return &cfg
}
