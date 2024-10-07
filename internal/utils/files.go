package utils

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"
	"tizzle-backend/internal/models"
)

func AudioFileToBase64(filename string) (string, error) {
	file, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(file), nil
}

func ReadJsonTranscript(filename string) (models.Lipsync, error) {
	file, err := os.Open(filename)
	if err != nil {
		return models.Lipsync{}, err
	}
	defer file.Close()

	byteValue, err := io.ReadAll(file)
	if err != nil {
		return models.Lipsync{}, err
	}

	var result models.Lipsync
	if err := json.Unmarshal(byteValue, &result); err != nil {
		return models.Lipsync{}, err
	}

	return result, nil
}

func ExecCommand(command string) (string, error) {
	cmd := exec.Command("sh", "-c", command)

	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", err
	}

	return out.String(), nil
}

func GetPhonemes(messageIndex int) error {
	startTime := time.Now()

	basePath, err := os.Getwd()
	if err != nil {
		return err
	}

	mp3Path := filepath.Join(basePath, "..", "..", "audios", "messages", fmt.Sprintf("message_%d.mp3", messageIndex))
	wavPath := filepath.Join(basePath, "..", "..", "audios", "messages", fmt.Sprintf("message_%d.wav", messageIndex))
	jsonPath := filepath.Join(basePath, "..", "..", "audios", "messages", fmt.Sprintf("message_%d.json", messageIndex))
	rhubarbPath := filepath.Join(basePath, "..", "..", "bin", "rhubarb")

	command := fmt.Sprintf("ffmpeg -y -i %s %s", mp3Path, wavPath)
	_, err = ExecCommand(command)
	if err != nil {
		return err
	}

	command = fmt.Sprintf("%s -f json -o %s %s -r phonetic", rhubarbPath, jsonPath, wavPath)
	_, err = ExecCommand(command)
	if err != nil {
		return err
	}

	log.Printf("lipsync done in %dms\n", time.Since(startTime).Microseconds())

	return nil
}
