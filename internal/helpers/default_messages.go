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

func DefaultTextAgent(agentName string) (string, string) {
	var text0, text1 string
	switch agentName {
	case "cortez":
		text0 = DEFAULT_CORTEZ_TEXT_0
		text1 = DEFAULT_CORTEZ_TEXT_1
	default:
		text0 = ""
		text1 = ""
	}

	return text0, text1
}

func DefaultMessages(agentName, userMessage string) ([]models.Message, error) {
	var messages []models.Message

	if userMessage == "" {
		basePath, err := os.Getwd()
		if err != nil {
			return nil, err
		}

		audio0Path := filepath.Join(basePath, "..", "..", "audios", agentName, fmt.Sprintf("%s_intro_0.wav", agentName))
		lipsync0Path := filepath.Join(basePath, "..", "..", "audios", agentName, fmt.Sprintf("%s_intro_0.json", agentName))

		audio1Path := filepath.Join(basePath, "..", "..", "audios", agentName, fmt.Sprintf("%s_intro_1.wav", agentName))
		lipsync1Path := filepath.Join(basePath, "..", "..", "audios", agentName, fmt.Sprintf("%s_intro_0.json", agentName))

		audio0, err := utils.AudioFileToBase64(audio0Path)
		if err != nil {
			return nil, err
		}
		lipsync0, err := utils.ReadJsonTranscript(lipsync0Path)
		if err != nil {
			return nil, err
		}

		audio1, err := utils.AudioFileToBase64(audio1Path)
		if err != nil {
			return nil, err
		}
		lipsync1, err := utils.ReadJsonTranscript(lipsync1Path)
		if err != nil {
			return nil, err
		}

		text0, text1 := DefaultTextAgent(agentName)

		messages = []models.Message{
			{
				Text:             text0,
				Audio:            audio0,
				Lipsync:          lipsync0,
				FacialExpression: "smile",
				Animation:        "TalkingOne",
			},
			{
				Text:             text1,
				Audio:            audio1,
				Lipsync:          lipsync1,
				FacialExpression: "smile",
				Animation:        "TalkingTwo",
			},
		}

		return messages, nil
	}

	return nil, errors.New("no default message generated")
}
