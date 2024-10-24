package repository

import (
	"context"
	"tizzle-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type (
	Token interface {
		Create(ctx context.Context, data *models.TokenHistory) error
	}

	TokenRepository struct {
		collection *mongo.Collection
	}
)

func NewTokenRepository(db *mongo.Database) Token {
	return &TokenRepository{collection: db.Collection("token_history")}
}

func (t *TokenRepository) Create(ctx context.Context, data *models.TokenHistory) error {
	res, err := t.collection.InsertOne(ctx, data)
	if err != nil {
		return err
	}

	data.ID = res.InsertedID.(primitive.ObjectID)

	return nil
}
