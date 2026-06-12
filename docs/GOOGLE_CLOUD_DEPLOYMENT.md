# Google Cloud Permanent Link Deployment

This project can run as one Google Cloud Run service. Cloud Run gives you a permanent HTTPS URL that opens in Google Chrome and can be sent to students.

## What You Need

- Google Cloud account with billing enabled
- Google Cloud Shell or local machine with `gcloud`
- OAuth 2.0 Web Client ID for Google Sign-In

## Fast Deployment From Google Cloud Shell

1. Upload or clone this project in Google Cloud Shell.
2. Set these values:

```bash
export PROJECT_ID="your-google-cloud-project-id"
export REGION="asia-south1"
export SERVICE="python-coding-platform"
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

3. Deploy:

```bash
bash scripts/deploy-google-cloud.sh
```

4. Copy the Cloud Run URL printed by Google Cloud, for example:

```text
https://python-coding-platform-xxxxx-as.a.run.app
```

5. In Google Cloud Console, open your OAuth Web Client and add that URL to:

```text
Authorized JavaScript origins
```

6. Redeploy once more with the same command so the frontend has the correct Google Client ID.

## Important Notes

- This fast setup uses in-memory data (`MEMORY_MODE=true`), so it is suitable for tomorrow's exam preparation link but student progress may reset if Cloud Run restarts.
- For permanent student records, add Cloud SQL PostgreSQL and set `DATABASE_URL` instead of `MEMORY_MODE=true`.
- Cloud Run gives a permanent URL, but a custom domain like `https://pythonlab.yourcollege.edu` must be mapped separately in Google Cloud Run.
