package dto

type TtsMessageRequest struct {
	Message   string `json:"message"`
	AccountId string `json:"account_id"`
}

type TextToSpeechRequest struct {
	FileName        string  `json:"fileName"`
	Text            string  `json:"text"`
	VoiceID         string  `json:"voiceID"`
	Stability       float64 `json:"stability"`
	SimilarityBoost float64 `json:"similarity_boost"`
	ModelID         string  `json:"model_id"`
}
