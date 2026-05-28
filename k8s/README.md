# Kubernetes — Go Consumer

Manifests for deploying the `feature-flag-consumer` Go service to a Kubernetes cluster.

## Manifests

| File | Kind | Purpose |
|------|------|---------|
| `consumer-configmap.yaml` | ConfigMap | Runtime configuration (Kafka broker, topic, group ID, backend URL) |
| `consumer-deployment.yaml` | Deployment | Runs 2 replicas of the consumer with resource limits and a liveness probe |
| `consumer-hpa.yaml` | HorizontalPodAutoscaler | Scales replicas 1–10 based on CPU utilization (see note below) |

## Prerequisites

### 1. Build and push the consumer image

The Deployment references `feature-flag-consumer:latest`. Build and push it to your container registry before applying:

```bash
docker build -t <your-registry>/feature-flag-consumer:latest ./feature-flag-consumer
docker push <your-registry>/feature-flag-consumer:latest
```

Then update the `image:` field in `consumer-deployment.yaml` to match your registry path.

### 2. Update the ConfigMap for production

`consumer-configmap.yaml` ships with placeholder values that match the local Docker Compose setup. Before deploying, update:

- **`KAFKA_BROKER`** — point to your production Kafka broker (not `kafka:29092`)
- **`BACKEND_URL`** — point to your deployed backend service (not `http://feature-flag-backend:3000`)

## Apply all manifests

```bash
kubectl apply -f k8s/
```

Apply order does not matter; `kubectl apply -f k8s/` processes all files in the directory.

## Useful commands

Check consumer logs:
```bash
kubectl logs -l app=feature-flag-consumer
```

Stream logs live:
```bash
kubectl logs -l app=feature-flag-consumer -f
```

Check autoscaler status:
```bash
kubectl get hpa
```

Check pod status:
```bash
kubectl get pods -l app=feature-flag-consumer
```

## Scaling note

The HPA currently scales on CPU utilization (60% threshold). For production, replace it with [KEDA](https://keda.sh/) configured to scale on Kafka consumer lag (`consumergroup/lag`). Lag-based scaling responds directly to backpressure on the `flag.toggled` topic rather than a CPU proxy metric, which behaves poorly for I/O-bound consumers.
