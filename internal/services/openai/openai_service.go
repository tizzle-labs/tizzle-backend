package openai

import (
	"context"
	"encoding/json"
	"log"
	"tizzle-backend/internal/helpers"
	"tizzle-backend/internal/models"

	"github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	openai *openai.Client
}

func NewOpenAIService(openai *openai.Client) *OpenAIService {
	return &OpenAIService{openai}
}

func (oai *OpenAIService) CallChatOpenAI(agentPrompt, userMessage string) ([]models.Message, error) {
	resp, err := oai.openai.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT4oMini20240718,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: agentPrompt,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: userMessage,
			},
		},
	})
	if err != nil {
		return nil, err
	}

	var messages []models.Message
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &messages)
	if err != nil {
		log.Printf("error unmarshaling response: %v", err)
		return helpers.DefaultResponse, nil
	}

	return messages, nil
}
