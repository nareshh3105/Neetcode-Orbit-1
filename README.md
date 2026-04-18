# NeetCode Orbit

Premium space-themed NeetCode tracker built with HTML, CSS, vanilla JavaScript, Firebase Authentication, and Firestore.

## Setup

1. Create a Firebase project.
2. Enable Authentication providers:
   - Email/Password
   - Google
3. Create Firestore database in production or test mode.
4. Copy `assets/js/firebase-config.example.js` to `assets/js/firebase-config.js`.
5. Fill your Firebase credentials in `assets/js/firebase-config.js`.
6. Serve this folder with any static server (for ES modules), for example:
   - VS Code Live Server
   - `python -m http.server`

## Data Paths

- `users/{userId}/progress/{date_questionId}`
- `users/{userId}/customSchedule/{date}`
- `users/{userId}/meta/summary`

## Pages

- `auth.html` Authentication
- `index.html` Mission control home
- `today.html` Daily 3 questions
- `calendar.html` Planner and editor modal
- `progress.html` Completion metrics and heatmap
- `profile.html` User summary and reset tracker
