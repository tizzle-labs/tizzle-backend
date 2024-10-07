package config

import (
	"os"

	"github.com/sashabaranov/go-openai"
)

func InitOpenAI() *openai.Client {
	return openai.NewClient(os.Getenv("OPENAI_API_KEY"))
}
