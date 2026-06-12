#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-python-coding-platform}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
JWT_SECRET="${JWT_SECRET:-}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "Set PROJECT_ID first, for example: export PROJECT_ID=my-gcp-project"
  exit 1
fi

if [[ -z "$JWT_SECRET" ]]; then
  JWT_SECRET="$(openssl rand -hex 32)"
fi

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,JWT_SECRET=$JWT_SECRET,MEMORY_MODE=true,EXECUTION_MODE=local"

echo
echo "Deployment complete. Add the Cloud Run URL shown above to Google OAuth Authorized JavaScript origins."
