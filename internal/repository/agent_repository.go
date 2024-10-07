package repository

import (
	"context"
	"time"
	"tizzle-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Agent interface {
	FindPromptByAgentName(name string) (*models.Agent, error)
}

type AgentRepository struct {
	collection *mongo.Collection
}

func NewAgentRepository(db *mongo.Database) Agent {
	return &AgentRepository{
		collection: db.Collection("agents"),
	}
}

func (a *AgentRepository) FindPromptByAgentName(name string) (*models.Agent, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var agent models.Agent
	if err := a.collection.FindOne(ctx, bson.M{"name": name}).Decode(&agent); err != nil {
		return nil, err
	}

	return &agent, nil
}
