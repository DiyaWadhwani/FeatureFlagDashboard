import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

export interface FlagToggledPayload {
  flagName: string;
  oldValue: boolean;
  newValue: boolean;
  tier: string;
  source: string;
  timestamp: string;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly producer: Producer;
  private connected = false;

  constructor() {
    const kafka = new Kafka({
      clientId: 'feature-flag-dashboard',
      brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.connected = true;
      console.log('🟩 Kafka producer connected');
    } catch (err) {
      console.warn('⚠️  Kafka producer unavailable — events will be skipped:', err);
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.producer.disconnect();
    }
  }

  publishFlagToggled(payload: FlagToggledPayload): void {
    if (!this.connected) return;
    this.producer
      .send({
        topic: 'flag.toggled',
        messages: [{ value: JSON.stringify(payload) }],
      })
      .catch((err) => console.error('Kafka publish failed:', err));
  }
}