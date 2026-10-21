# AttenX - Desktop Windows Application 🖥️

Official Windows desktop application for the **AttenX NBA CO-PO Attainment Workbench**.

## Features
- **Standalone Desktop App**: Runs natively on Windows 10 & 11 with no browser or internet required.
- **Instant Vector-Sharp PDF Generation**: Leverages native Windows Word COM automation for 100% authentic formatting.
- **Offline Capable**: Stores all student marks, CO mappings, and attainment calculation records locally.
- **Automated Updates**: Integrates `electron-updater` to silently download and apply updates from GitHub Releases.

## Development

```bash
# 1. Install all dependencies (root, frontend, and backend)
npm run postinstall

# 2. Run in development mode with hot-reloading
npm run dev
```

## Packaging & Building Windows Installer (.exe)

```bash
# Build production Windows Setup installer and portable executable
npm run dist
```

The compiled installer will be in the `release/` directory:
- `release/AttenX Setup 1.0.0.exe`
- `release/AttenX 1.0.0.exe` (Portable standalone)
