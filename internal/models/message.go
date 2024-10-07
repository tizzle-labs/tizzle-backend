package models

type Message struct {
	Text             string  `json:"text"`
	Audio            string  `json:"audio"`
	Lipsync          Lipsync `json:"lipsync"`
	FacialExpression string  `json:"facialExpression"`
	Animation        string  `json:"animation"`
	Index            int     `json:"index"`
}

type Lipsync struct {
	Metadata  Metadata    `json:"metadata"`
	MouthCues []MouthCues `json:"mouthCues"`
}

type Metadata struct {
	Duration  float32 `json:"duration"`
	SoundFile string  `json:"soundFile"`
}

type MouthCues struct {
	End   float32 `json:"end"`
	Start float32 `json:"start"`
	Value string  `json:"value"`
}
