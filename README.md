# 🪶 Quillboard

A sleek, cross-platform desktop app to organize and manage your AI prompts. Built with **Tauri V2**, **TypeScript**, and **Vanilla CSS**.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-v2-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)

## ✨ Features

- **Kanban Board Layout** — Organize prompts visually across customizable columns
- **Quick Search** — Press `Ctrl/Cmd + K` to instantly find any prompt
- **Color Labels** — Categorize prompts with color-coded labels
- **Icon Selection** — Add visual identifiers to your prompts
- **Tags Support** — Tag prompts for easy filtering
- **Advanced LLM Options** — Configure Temperature, Top K, Max Tokens, and Model Name per prompt
- **One-Click Copy** — Quickly copy prompts to clipboard
- **Dark Theme** — Beautiful dark UI with smooth animations

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd promptOrganizer

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Build for Production

```bash
pnpm tauri build
```

## 🎮 Usage

| Action | Shortcut |
|--------|----------|
| Quick Search | `Ctrl/Cmd + K` |
| New Prompt | Click **+ New** button |
| Edit Prompt | Select card → Click **Edit** |
| Delete Prompt | Select card → Click **Delete** |
| Copy Prompt | Click on card → Click **Copy** |

## 🛠 Tech Stack

- **Framework**: [Tauri V2](https://v2.tauri.app/)
- **Frontend**: TypeScript, HTML, Vanilla CSS
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Package Manager**: pnpm

## 📁 Project Structure

```
promptOrganizer/
├── src/
│   ├── main.ts          # Application logic
│   ├── styles.css       # Styling
│   └── assets/          # Static assets
├── src-tauri/           # Tauri/Rust backend
├── index.html           # Main HTML entry
├── vite.config.ts       # Vite configuration
└── package.json
```

## 🔧 Development

```bash
# Start dev server (web only)
pnpm dev

# Start Tauri dev (desktop app)
pnpm tauri dev

# Type check
pnpm build
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
