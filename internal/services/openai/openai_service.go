package openai

import (
	"context"
	"encoding/json"
	"fmt"
	"tizzle-backend/internal/models"

	"github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	openai *openai.Client
}

func NewOpenAIService(openai *openai.Client) *OpenAIService {
	return &OpenAIService{openai}
}

func (oai *OpenAIService) CallChatOpenAI(message string) ([]models.Message, error) {
	resp, err := oai.openai.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT3Dot5Turbo,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: message,
			},
		},
	})
	if err != nil {
		return nil, err
	}

	var messages []models.Message
	err = json.Unmarshal([]byte(resp.Choices[0].Message.Content), &messages)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling response: %v", err)
	}

	return messages, nil
}
