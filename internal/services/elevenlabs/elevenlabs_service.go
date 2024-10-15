package elevenlabs

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
	"tizzle-backend/internal/models"
	"tizzle-backend/internal/utils"

	"github.com/haguro/elevenlabs-go"
)

type ElevenLabService struct {
	APIKey  string
	VoiceID string
	ModelID string
}

func NewElevenLabs(elabs ElevenLabService) *ElevenLabService {
	return &ElevenLabService{
		APIKey:  elabs.APIKey,
		VoiceID: elabs.VoiceID,
		ModelID: elabs.ModelID,
	}
}

func (e *ElevenLabService) ConvertTexttoSpeech(text, filename, agentName string) error {
	client := elevenlabs.NewClient(context.Background(), e.APIKey, 30*time.Second)
	voiceID := utils.GetAgentVoiceID(agentName)

	ttsReq := elevenlabs.TextToSpeechRequest{
		Text:    text,
		ModelID: e.ModelID,
	}

	audio, err := client.TextToSpeech(voiceID, ttsReq)
	if err != nil {
		log.Fatal(err)
	}

	if err := os.WriteFile(filename, audio, 0644); err != nil {
		log.Fatal(err)
	}

	return nil
}

func (e *ElevenLabService) LipSync(messages []models.Message, agentName string) ([]models.Message, error) {
	basePath, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	for idx, msg := range messages {
		fileName := filepath.Join(basePath, "..", "..", "audios", "messages", fmt.Sprintf("message_%d.mp3", idx))

		if err := e.ConvertTexttoSpeech(msg.Text, fileName, agentName); err != nil {
			break
		}
	}

	for idx := range messages {
		fileName := filepath.Join(basePath, "..", "..", "audios", "messages", fmt.Sprintf("message_%d.mp3", idx))

		if err := utils.GetPhonemes(idx); err != nil {
			return nil, err
		}

		audioBase64, err := utils.AudioFileToBase64(fileName)
		if err != nil {
			return nil, err
		}
		messages[idx].Audio = audioBase64

		jsonFileName := filepath.Join(basePath, "..", "..", "audios", "messages", fmt.Sprintf("message_%d.json", idx))
		lipSyncData, err := utils.ReadJsonTranscript(jsonFileName)
		if err != nil {
			return nil, err
		}
		messages[idx].Lipsync = lipSyncData
	}

	return messages, nil

}
