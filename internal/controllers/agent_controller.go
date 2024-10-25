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
	userRepo   repository.User
}

func NewAgentController(agentRepo repository.Agent, openai *openai.OpenAIService, elevenlabs *elevenlabs.ElevenLabService, userRepo repository.User) *AgentController {
	return &AgentController{agentRepo, openai, elevenlabs, userRepo}
}

func (a *AgentController) PostTextToSpeech(c *gin.Context) {
	agentName := c.Param("name")

	bodyReq := new(dto.TtsMessageRequest)
	if err := c.Bind(&bodyReq); err != nil {
		status, errResp := utils.ErrBadRequest.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	if bodyReq.Message == "" {
		status, errResp := utils.ErrBadRequest.GinFormatDetails("Invalid body request")
		c.JSON(status, errResp)
		return
	}

	user, err := a.userRepo.FindNByAccountID(bodyReq.AccountId)
	if err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	if user.Tokens <= 0 {
		defaultMessages, err := helpers.InsufficientMessages(agentName, "insufficient-tokens")
		if err != nil {
			status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
			c.JSON(status, errResp)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"messages":       defaultMessages,
			"current_tokens": 0,
		})
		return
	}

	// reduce 1 token/request
	currTokens := user.Tokens - 1
	if err := a.userRepo.UpdateToken(user.AccountID, int(currTokens)); err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	agent, err := a.agentRepo.FindPromptByAgentName(agentName)
	if err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	resp, err := a.openai.CallChatOpenAI(agent.Prompt, bodyReq.Message)
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
		"messages":       resp,
		"current_tokens": currTokens,
	})
}
