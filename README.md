# 🎥 Calastream - Where Video Meets Audience

> A modern video streaming platform that enables creators to upload, manage, and share videos while building an engaged community.

---

## ✨ Features

- 🎬 Upload and manage videos
- 📺 Create and customize creator channels
- ❤️ Like and interact with videos
- 🔐 Secure user authentication
- 🎥 Modern video player with Plyr
- ⚡ Fast frontend powered by React + Vite
- 🎨 Responsive UI built with Tailwind CSS
- 🚀 Smooth animations using Framer Motion
- 📱 Mobile-friendly interface

---

# 🛠 Tech Stack

## Frontend

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Video Player:** Plyr + Plyr React

## Backend

- TypeScript
- Bun Runtime

---

# 📂 Project Structure

```
calastream/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env.local
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

- Node.js **v20+**
- Bun **v1.3.8+**

---

## Installation

Clone the repository.

```bash
git clone https://github.com/vaibhuujoshi/calastream.git

cd calastream
```

### Install Frontend

```bash
cd frontend
bun install
```

### Install Backend

```bash
cd ../backend
bun install
```

---

# ⚙ Environment Variables

Create a `.env.local` file inside the **backend** directory.

```env
# Example

PORT=5000

DATABASE_URL=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CLIENT_URL=http://localhost:5173
```

> Replace the values with your own credentials.

---

# ▶ Running the Project

### Backend

```bash
cd backend

bun run dev
```

### Frontend

```bash
cd frontend

bun run dev
```

---

# 📸 Core Features

## 🎥 Video Upload

- Upload videos
- Manage uploaded content
- Edit video details

## 📺 Channels

- Personal creator channel
- Custom branding
- Creator profile

## ❤️ Engagement

- Like videos
- View creator content
- Community interaction

## 🔐 Authentication

- User registration
- Secure login
- Protected routes

---

# 📦 Built With

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- Plyr
- Bun

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes.

```bash
git commit -m "Add amazing feature"
```

4. Push the branch.

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub!