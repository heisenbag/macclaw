# MacClaw

> **Complex Workflows. One simple command.**

MacClaw is a 100% native CLI autonomous agent for macOS. It bridges high-level semantic reasoning with pixel-perfect accuracy to automate your desktop and browser without the weight of an Electron app or complex installations.

[![NPM Version](https://img.shields.io/npm/v/macclaw.svg)](https://www.npmjs.com/package/macclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

No heavy installs. Just run via `npx`:

```bash
npx macclaw chat
```

On your first run, MacClaw will ask for your **OpenRouter API Key** to power its reasoning engine.

## ✨ Key Features (v0.3.3)

- **Zero Friction**: Run instantly from any terminal. No GUI wrappers or "Install" buttons needed.
- **Grounding Bridge**: Powered by **UI-TARS 7B**, MacClaw accurately translates model thoughts into physical macOS mouse coordinates.
- **On-Device Voice (TTS)**: Hear the agent explain its thoughts in real-time with integrated **Kokoro-82M** (100% local, zero-latency).
- **Robust Bash Engine**: Advanced shell execution with `nullglob` and native `afplay` integration.
- **Mid-Flight Hotswapping**: Use `/model` or `/key` commands directly in the prompt to switch engines or credentials without restarting.

## 📖 Documentation

For full installation guides, grounding architecture deep-dives, and command references, visit our documentation:

👉 **[MacClaw Docs](https://github.com/heisenbag/macclaw/tree/main/macclaw-web)** (or run the local development server in the `macclaw-web` directory).

## 🛠️ Development

If you'd like to contribute or run the source locally:

1. **Clone the repo**:
   ```bash
   git clone https://github.com/heisenbag/macclaw.git
   cd macclaw
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Run in dev mode**:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

This repository is built for the community. We welcome PRs for new slash commands, better grounding mutations, or UI improvements to the docs site.

---
*Built with ❤️ for macOS power users.*
