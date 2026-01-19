# Railway Deployment Guide

## Phase 1: Push to GitHub

Railway pulls your code from GitHub. You need to upload your project there.

1.  **Create a Repo**: Go to [GitHub](https://github.com/new) and create a new repository named `bluelady-tracker`.
2.  **Push Code**: Open a terminal in `bluelady` folder and run:
    ```powershell
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/bluelady-tracker.git
    git push -u origin main
    ```

## Phase 2: Deploy on Railway

1.  Go to [Railway.app](https://railway.app/) and Login.
2.  Click **New Project** > **Deploy from GitHub repo**.
3.  Select `bluelady-tracker`.
4.  Click **Deploy Now**.
5.  **Wait**: Railway will install dependencies and start the server.
6.  **Domain**: Go to **Settings** > **Domains** > **Generate Domain**.
    - Copy this URL (e.g., `https://bluelady-production.up.railway.app`).

## Phase 3: Setup Superuser (Cloud DB)

Your local database stays on your PC. You need a new admin for the cloud.

1.  In Railway, click your project > **Variables**.
2.  Add a new variable: `DISABLE_COLLECTSTATIC` = `1` (Optional, if build fails).
3.  Go to **Build** tab to see logs.
4.  Once deployed, go to the **Shell** tab (or run command via CLI if installed, or use Railway Dashboard's "Command" feature if available, otherwise simplified):
    - _Easiest way_: In your local terminal, if you install railway CLI, or just use the Django Admin after we successfully deploy.
    - Actually, you need to run migrations first!
    - Railway automatically runs the build command. We need to run `python manage.py migrate` in the **Start Command** or manually.
    - **Action**: Go to **Settings** > **Deploy** > **Start Command**.
    - Set it to: `python manage.py migrate && gunicorn employee_tracker.wsgi --log-file -`
    - Redeploy.
5.  **Create Superuser**:
    - We can't easily run interactive commands.
    - **Trick**: Add a temporary view or use a script.
    - _Alternative_: I have added a valid `create_superuser.py` script. You can run it as part of the start command once: `python create_superuser.py && python manage.py migrate ...`

## Phase 4: Update Mobile App

Now that the backend is on the internet, tell the mobile app to use it.

1.  Open `mobile/src/services/api.ts`.
2.  Change `API_URL`:
    ```typescript
    // const API_URL = 'http://192.168.1.12:8000/api'; // OLD
    const API_URL = "https://YOUR-RAILWAY-URL.up.railway.app/api"; // NEW
    ```
3.  **Rebuild APK**:
    - Run `npx expo prebuild --platform android --clean`
    - Run `cd mobile/android && gradlew assembleRelease`
4.  Install the new APK. Now it works consistently anywhere!

**Final API URL:** `https://bluelady-tracker-production.up.railway.app/api`
