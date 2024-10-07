package utils

import (
	"time"
)

func Delay(ms time.Duration) {
	time.Sleep(ms * time.Millisecond)
}
