# St. Anne’s Youth Website

Official website for St. Anne’s Youth — a modern youth community platform built to connect, inspire, and engage members through events, announcements, galleries, registrations, and interactive features.

🌐 Live Website: [https://stannesyouth.vercel.app/](https://stannesyouth.vercel.app/)

---

## Features

* Modern responsive UI
* Firebase Authentication
* Firestore Database Integration
* Firebase Storage
* Event announcements and updates
* Interactive youth community platform
* Mobile-friendly design
* Fast deployment with Vercel

---

## Tech Stack

### Frontend

* Vite
* TypeScript
* Tailwind CSS
* React

### Backend & Services

* Firebase Authentication
* Firestore Database
* Firebase Storage
* Firebase Hosting Services

### Deployment

* Vercel

---

## Project Structure

```bash
stannesyouth/
│
├── public/
├── src/
├── firebase.json
├── firestore.rules
├── storage.rules
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Installation & Setup

### Clone the repository

```bash
git clone https://github.com/benedictX-stack/stannesyouth.git
```

### Navigate into the project

```bash
cd stannesyouth
```

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Deployment

This project is deployed using Vercel.

To deploy:

```bash
npm run build
```

Then connect the repository to Vercel for automatic deployments.

---

## Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Developed For

St. Anne’s Youth Community

