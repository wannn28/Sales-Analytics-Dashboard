package config

import (
	"fmt"
	"os"
)

type Config struct{ Address, DatabaseURL string }

func Load() (Config, error) {
	c := Config{Address: os.Getenv("HTTP_ADDR"), DatabaseURL: os.Getenv("DATABASE_URL")}
	if c.Address == "" {
		c.Address = "127.0.0.1:18080"
	}
	if c.DatabaseURL == "" {
		return c, fmt.Errorf("DATABASE_URL is required")
	}
	return c, nil
}
