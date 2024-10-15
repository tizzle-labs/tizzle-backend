package utils

import (
	"os"
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
