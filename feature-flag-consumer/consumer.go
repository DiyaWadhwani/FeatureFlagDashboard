package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	kafka "github.com/segmentio/kafka-go"
)

type flagToggledEvent struct {
	FlagName  string `json:"flagName"`
	OldValue  bool   `json:"oldValue"`
	NewValue  bool   `json:"newValue"`
	Tier      string `json:"tier"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
}

func runConsumer(
	ctx context.Context,
	logger *slog.Logger,
	broker, topic, groupID, backendURL string,
) error {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  []string{broker},
		Topic:    topic,
		GroupID:  groupID,
		MinBytes: 1,
		MaxBytes: 10e6,
		MaxWait:  time.Second,
	})
	defer r.Close()

	for {
		msg, err := r.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return nil // graceful shutdown
			}
			return err
		}

		var event flagToggledEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			logger.Warn("failed to parse message", "err", err, "raw", string(msg.Value))
			continue
		}

		logger.Info("flag toggled",
			"flagName", event.FlagName,
			"oldValue", event.OldValue,
			"newValue", event.NewValue,
			"tier", event.Tier,
			"source", event.Source,
			"timestamp", event.Timestamp,
		)

		// Stub: invalidate config cache
		if backendURL != "" {
			go func(url string) {
				resp, err := http.Get(url + "/config")
				if err != nil {
					logger.Warn("cache invalidation request failed", "err", err)
					return
				}
				resp.Body.Close()
				logger.Info("cache invalidation triggered", "url", url+"/config")
			}(backendURL)
		}

		// Stub: webhook dispatcher
		logger.Info("would send webhook to: [url]",
			"flagName", event.FlagName,
			"newValue", event.NewValue,
		)
	}
}