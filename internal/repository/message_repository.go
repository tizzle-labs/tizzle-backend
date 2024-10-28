package repository

import (
	"context"
	"errors"
	"time"
	"tizzle-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MessageHistories interface {
	Create(data *models.MessageHistories) error
	FindByAccountID(accountID string) (*models.MessageHistories, error)
	Update(accountID string, userMessage string) error
}

type MessageHistoriesRepository struct {
	collection *mongo.Collection
}

func NewMessageHistoriesRepository(db *mongo.Database) MessageHistories {
	return &MessageHistoriesRepository{collection: db.Collection("message_histories")}
}

func (u *MessageHistoriesRepository) Create(data *models.MessageHistories) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	res, err := u.collection.InsertOne(ctx, data)
	if err != nil {
		return err
	}

	data.ID = res.InsertedID.(primitive.ObjectID)

	return nil
}

func (u *MessageHistoriesRepository) FindByAccountID(accountID string) (*models.MessageHistories, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var messageHistories models.MessageHistories
	if err := u.collection.FindOne(ctx, bson.M{"account_id": accountID}).Decode(&messageHistories); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("no-result")
		}
		return nil, err
	}

	return &messageHistories, nil
}

func (u *MessageHistoriesRepository) Update(accountID string, userMessage string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	newMessage := models.Messages{
		User: userMessage,
	}

	filter := bson.M{"account_id": accountID}

	update := bson.M{
		"$push": bson.M{
			"messages": bson.M{
				"$each":  []models.Messages{newMessage},
				"$slice": -100, // history limits
			},
		},
	}

	_, err := u.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("no-result")
		}
		return err
	}

	return nil
}
