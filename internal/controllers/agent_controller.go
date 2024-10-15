package controllers

import (
	"net/http"
	"tizzle-backend/internal/dto"
	"tizzle-backend/internal/helpers"
	"tizzle-backend/internal/repository"
	"tizzle-backend/internal/services/elevenlabs"
	"tizzle-backend/internal/services/openai"
	"tizzle-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type AgentController struct {
	agentRepo  repository.Agent
	openai     *openai.OpenAIService
	elevenlabs *elevenlabs.ElevenLabService
}

func NewAgentController(agentRepo repository.Agent, openai *openai.OpenAIService, elevenlabs *elevenlabs.ElevenLabService) *AgentController {
	return &AgentController{agentRepo, openai, elevenlabs}
}

func (a *AgentController) PostTextToSpeech(c *gin.Context) {
	agentName := c.Param("name")

	bodyReq := new(dto.TtsMessageRequest)
	if err := c.Bind(&bodyReq); err != nil {
		status, errResp := utils.ErrBadRequest.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	userMessage := bodyReq.Message
	if len(userMessage) == 0 {
		defaultMessages, err := helpers.DefaultMessages(agentName, userMessage)
		if err != nil {
			status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
			c.JSON(status, errResp)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"messages": defaultMessages,
		})
		return
	}

	agent, err := a.agentRepo.FindPromptByAgentName(agentName)
	if err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	resp, err := a.openai.CallChatOpenAI(agent.Prompt, userMessage)
	if err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	resp, err = a.elevenlabs.LipSync(resp, agentName)
	if err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": resp,
	})
}
