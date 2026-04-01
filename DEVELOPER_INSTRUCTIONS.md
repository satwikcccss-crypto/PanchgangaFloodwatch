# Developer Onboarding: Google IDX Setup

This guide provides step-by-step instructions for developers joining the **Panchganga Floodwatch Dashboard** project using **Google IDX**.

## 1. Launching the Project
1.  Navigate to the repository on GitHub.
2.  Open the repository in Google IDX.
3.  The project will automatically configure the environment (Node.js 20, npm, and extensions) using the `.idx/dev.nix` file.

## 2. Environment Verification
1.  Once the workspace is ready, the system will execute `npm install` for you.
2.  Wait for the terminal to finish the installation process.
3.  The development server will automatically start at `http://localhost:5173`.
4.  Open the **Web Preview** tab to view the dashboard live.

## 3. Recommended Workflow
*   **Feature Development**: Create a new branch for each feature or bug fix.
*   **Code Quality**: The system includes Prettier and ESLint. Please ensure your code is linted before committing.
*   **Mock Data**: While in development, the dashboard will automatically fall back to mock data if ThingSpeak API keys are not provided. This allows you to test interactions without a live sensor feed.

## 4. Key Configuration Files
*   `src/config/sensors.js`: Main sensor metadata, coordinates, and ThingSpeak credentials.
*   `src/config/alerts.js`: Alert thresholds (Warning, Danger, Extreme) and Google Form URLs.
*   `src/config/mapConfig.js`: Default map center and zoom levels.

## 5. Troubleshooting
*   **Server not starting**: If the dev server doesn't start automatically, run `npm run dev` in the terminal.
*   **Dependency errors**: Re-run `npm install` if you see missing package errors.
*   **Port conflicts**: Vite will automatically pick the next available port if `5173` is busy. Update the IDX preview configuration if needed.

---
*For technical architecture details, refer to [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md).*
