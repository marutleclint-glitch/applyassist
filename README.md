# Apply Assist

# RMGT FILES
A job application tracking tool to help you organize your job search process.

## Features

- Track job applications and their statuses
- Store and manage multiple versions of your resume
- Keep notes on each application
- Set reminders for follow-ups
- Dashboard with application statistics

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`

## Technologies Used

- React
- Material UI
- React Router
- Local Storage for data persistence
## Deployment

You can deploy the already-built production files in `build/` without any backend.

### Continuous Deployment (Netlify)

- This site is linked to Netlify CI/CD.
- Production URL: https://applyassist.netlify.app
- Builds run automatically on pushes to `main` using `npm run build` and publish `build/`.

- Netlify (fastest)
  - Drag-and-drop: open `https://app.netlify.com/drop`, upload the `build` folder (or `build.zip`). Netlify will give you a live URL instantly.
  - CLI (requires login):
    - `npm i -g netlify-cli`
    - `netlify login`
    - `netlify deploy --dir build --prod`
  - SPA routing is configured via `netlify.toml`.

- Firebase Hosting
  - Prereqs: `npm i -g firebase-tools`, `firebase login`
  - Initialize (one-time): `firebase init hosting` and choose `build` as the public directory (or use the provided `firebase.json`).
  - Deploy: `firebase deploy --only hosting`
  - SPA routing is configured via `firebase.json`.

- Vercel (optional)
  - `npx vercel deploy build --prod --yes` (requires login)
  - For full-source deployments, add a `vercel.json` or use dashboard defaults.

- GitHub Pages (optional)
  - Requires a GitHub repo. Simplest is to serve `build/` from any static host, or set up Actions to publish to Pages.

### Notes
- The app currently runs with `useLocalStorage=true` mode, so there is no backend required.
- If you use GitHub Pages, set the `homepage` field in `package.json` to your repository Pages URL to ensure asset paths resolve.