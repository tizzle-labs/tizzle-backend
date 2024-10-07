package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Agent struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name   string             `bson:"name" json:"name"`
	Prompt string             `bson:"prompt" json:"prompt"`
}
