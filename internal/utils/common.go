package utils

import (
	"os"
	"regexp"
	"strings"
	"time"
)

func Delay(ms time.Duration) {
	time.Sleep(ms * time.Millisecond)
}

func GetAgentVoiceID(agentName string) string {
	switch agentName {
	case "cortez":
		return os.Getenv("CORTEZ_VOICE_ID")
	case "akira":
		return os.Getenv("AKIRA_VOICE_ID")
	case "bale":
		return os.Getenv("BALE_VOICE_ID")
	default:
		return os.Getenv("CORTEZ_VOICE_ID")
	}
}

func CleanOpenAIResponse(response string) string {
	re := regexp.MustCompile("(?s)```json(.*?)```")
	cleanedResponse := re.ReplaceAllString(response, "$1")
	return strings.TrimSpace(cleanedResponse)
}
