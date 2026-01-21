# 3D Print Price Calculator

A professional, open-source 3D printing price calculator and quote management tool by **Rp Hobbyist**. This application allows users to calculate costs for both FDM and Resin printing, manage materials and machines, and track quotes.

🔗 **[Visit Rp Hobbyist](https://linktr.ee/RPHobbyist)**

## Features

- **Dual Technology Support**: Separate calculators for FDM (Filament) and Resin (SLA/DLP) printing.
- **Smart Auto-Fill**: Upload G-code (`.gcode`, `.3mf`) or Resin files (`.cxdlpv4`) to automatically extract print time, weight, and volume.
- **Thumbnail Previews**: Visual preview of uploaded 3D files.
- **Inventory Management**: Track costs for Filaments, Resins, and Consumables (gloves, IPA, etc.).
- **Machine Presets**: Store hourly rates and specifications for multiple printers.
- **Quote Dashboard**: Save, view, and export past quotes.
- **Responsive Design**: Built with a mobile-first approach using Shadcn UI.
- **Cross-Platform**: Available as a web app and a Desktop application (via Electron).

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/RPHobbyist/3d-print-price-calculator.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Building for Production

To build the web application:
```bash
npm run build
```
To build the desktop application:
```bash
# Verify electron-builder scripts in package.json
npm run electron:build
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.
Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

## License

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This project is open source and available under the **GNU Affero General Public License v3 (AGPLv3)**.

You are free to use, modify, and distribute this software, but **if you run a modified version as a network service, you must release your source code to the community**.

See the `LICENSE` file for more information.

---

Made by Rp Hobbyist
