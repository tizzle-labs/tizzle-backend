package helpers

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"tizzle-backend/internal/models"
	"tizzle-backend/internal/utils"
)

var DefaultResponse = []models.Message{
	{
		Text:             "I'm sorry, can you repeat again?",
		FacialExpression: "default",
		Animation:        "Idle",
	},
}

func InsufficientTextAgent(agentName string) string {
	var text0 string
	switch agentName {
	case "cortez":
		text0 = INSUFFICIENT_CORTEZ_TEXT_0
	case "akira":
		text0 = INSUFFICIENT_AKIRA_TEXT_0
	case "bale":
		text0 = INSUFFICIENT_BALE_TEXT_0
	default:
		text0 = ""
	}

	return text0
}

func InsufficientMessages(agentName, userMessage string) ([]models.Message, error) {
	var messages []models.Message

	if userMessage == "insufficient-tokens" {
		basePath, err := os.Getwd()
		if err != nil {
			return nil, err
		}

		audio0Path := filepath.Join(basePath, "audios", agentName, fmt.Sprintf("%s_insufficient_0.wav", agentName))
		lipsync0Path := filepath.Join(basePath, "audios", agentName, fmt.Sprintf("%s_insufficient_0.json", agentName))

		audio0, err := utils.AudioFileToBase64(audio0Path)
		if err != nil {
			return nil, err
		}
		lipsync0, err := utils.ReadJsonTranscript(lipsync0Path)
		if err != nil {
			return nil, err
		}

		text0 := InsufficientTextAgent(agentName)

		messages = []models.Message{
			{
				Text:             text0,
				Audio:            audio0,
				Lipsync:          lipsync0,
				FacialExpression: "default",
				Animation:        "Listening",
			},
		}

		return messages, nil
	}

	return nil, errors.New("no default message generated")
}
