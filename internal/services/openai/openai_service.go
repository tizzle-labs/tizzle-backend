package openai

import (
	"context"
	"encoding/json"
	"log"
	"tizzle-backend/internal/helpers"
	"tizzle-backend/internal/models"
	"tizzle-backend/internal/utils"

	"github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	openai *openai.Client
}

func NewOpenAIService(openai *openai.Client) *OpenAIService {
	return &OpenAIService{openai}
}

func (oai *OpenAIService) CallChatOpenAI(agentPrompt, userMessage string, messageHistory []models.Messages) ([]models.Message, error) {
	var historyText string
	for _, msg := range messageHistory {
		historyText += "User: " + msg.User + "\n"
	}
	fullPrompt := agentPrompt + "\n\n" + "Message History:\n" + historyText

	resp, err := oai.openai.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT4oMini20240718,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: fullPrompt,
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

	rawResp := resp.Choices[0].Message.Content
	cleanedContent := utils.CleanOpenAIResponse(rawResp)

	log.Println("raw resp:", rawResp)
	log.Println("cleaned resp:", cleanedContent)

	var messages []models.Message
	err = json.Unmarshal([]byte(cleanedContent), &messages)
	if err != nil {
		log.Printf("error unmarshaling response: %v", err)
		return helpers.DefaultResponse, nil
	}

	return messages, nil
}
