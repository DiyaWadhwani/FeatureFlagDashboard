package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	broker := getEnv("KAFKA_BROKER", "kafka:9092")
	topic := getEnv("KAFKA_TOPIC", "flag.toggled")
	groupID := getEnv("KAFKA_GROUP_ID", "feature-flag-consumer")
	backendURL := getEnv("BACKEND_URL", "")

	logger.Info("starting consumer",
		"broker", broker,
		"topic", topic,
		"group", groupID,
	)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := runConsumer(ctx, logger, broker, topic, groupID, backendURL); err != nil {
		logger.Error("consumer exited with error", "err", err)
		os.Exit(1)
	}

	logger.Info("consumer stopped")
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}