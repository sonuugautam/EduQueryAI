# Authentication Configuration Guide

To enable live Google and GitHub logins, follow these steps:

## 1. Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Search for "APIs & Services" > "OAuth consent screen". Configure it as "External".
4. Go to "Credentials" > "Create Credentials" > "OAuth client ID".
5. Select "Web application".
6. Add Authorized redirect URIs: `http://localhost:8000/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret** into your `.env` file.

## 2. GitHub OAuth Setup
1. Go to your GitHub [Developer Settings](https://github.com/settings/developers).
2. Click "New OAuth App".
3. Set Homepage URL: `http://localhost:5173`
4. Set Authorization callback URL: `http://localhost:8000/api/auth/github/callback`
5. Register the application.
6. Copy the **Client ID** and generate a new **Client Secret**.
7. Paste them into your `.env` file.

## 3. Environment Variables
Ensure your `.env` file looks like this:
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

## 4. Restart Backend
Once you've updated the `.env` file, the backend will automatically reload (if using `--reload`) or you can restart it to apply the changes.
