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

type User interface {
	Create(data *models.User) error
	FindNByAccountID(accountID string) (*models.User, error)
	UpdateToken(accountID string, token int) error
}

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(db *mongo.Database) User {
	return &UserRepository{collection: db.Collection("users")}
}

func (u *UserRepository) Create(data *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	res, err := u.collection.InsertOne(ctx, data)
	if err != nil {
		return err
	}

	data.ID = res.InsertedID.(primitive.ObjectID)

	return nil
}

func (u *UserRepository) FindNByAccountID(accountID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	if err := u.collection.FindOne(ctx, bson.M{"account_id": accountID}).Decode(&user); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("no-result")
		}
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) UpdateToken(accountID string, token int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"account_id": accountID}
	update := bson.M{
		"$set": bson.M{
			"tokens": token,
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
