package dto

import "tizzle-backend/internal/models"

type OpenAIResponse struct {
	Messages []models.Message `json:"messages"`
}
