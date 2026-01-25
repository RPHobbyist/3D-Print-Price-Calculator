# PolymagicPrice Master Logic & Architecture Mindmap

This document serves as the unified source of truth for the PolymagicPrice application, detailing its features, system architecture, technical stack, and logical interdependencies.

---

## 1. Application Structure (Mindmap)

```mermaid
mindmap
  root((PolymagicPrice))
    Calculator (Index)
      FDM Printing
        - G-code Analysis
        - Material Selection
        - Machine Selection
        - Post-processing Options
      Resin Printing
        - Volume Extraction
        - Resin Selection
        - Machine Selection
        - Consumable Tracking
      Quote Summary
        - Real-time Price Update
        - Save Quote
        - Export PDF/CSV
    Database & Settings
      Materials
        - Filament Specs (FDM)
        - Resin Specs (Resin)
      Machines
        - Printer Presets
        - Hourly Rates
        - Build Volume
      Business
        - Company Info
        - Employee Manager
        - CRM (Customers)
      Maintenance
        - Data Import/Export
        - Printer Connections (LAN/Cloud)
    Post-Calculation
      Saved Quotes
        - History Tracking
        - Notes Management
        - Duplicate / Re-calculate
      Order Management
        - Kanban (Quote Status)
        - Workflow Tracking (Pending -> Done)
      Production (Print Management)
        - Global Job Queue
        - Machine Assignment (Drag & Drop)
        - Remote Print Control (Electron)
        - Capacity Planning
```

---

## 2. System Architecture & Flow

### A. High-Level Architecture (Electron/React)
PolymagicPrice is a cross-platform application using the **Electron** framework for desktop and **Vite/React** for the frontend.

```mermaid
graph TD
    subgraph "Desktop Environment (Electron)"
        Main[Main Process - Node.js]
        Preload[Preload Script - Context Bridge]
        Hardware[Printer Protocol Drivers]
    end

    subgraph "Renderer Process (Web/UI)"
        UI[React Components - Shadcn UI]
        Router[Hash Router]
        Store[Context/Hooks - State Management]
    end

    subgraph "Data Layer"
        LS[(Local Storage)]
        FS[(File System - Desktop Only)]
    end

    UI <--> Preload
    Preload <--> Main
    Main <--> Hardware
    UI <--> Store
    Store <--> LS
    Main <--> FS
```

### B. Closed-Loop Logic Flow
The application operates as a feedback loop where settings drive calculations, and production outcomes validate future pricing strategies.

```mermaid
graph TD
    %% Base Layer
    DB[(Global Settings DB)] -- "1. Drives Cost Basis" --> Calc[Calculator Index]
    
    %% Input Layer
    User((User)) -- "2. Uploads G-code/Resin" --> Calc
    Calc -- "3. Parses Metadata" --> Preview[Thumbnail & Stats]
    
    %% Decision Layer
    Calc -- "4. Generates Quote" --> Quote[Quote Summary]
    Quote -- "5. Action: Save Quote" --> Orders[Order Management]
    
    %% Execution Layer
    Orders -- "6. Workflow Trigger" --> Prod[Print Management]
    Prod -- "7. Action: Send to Printer" --> Hardware[[3D Printer]]
    
    %% Close-Loop Feedback
    Hardware -- "8. Status Feedback" --> Prod
    Prod -- "9. Production Stats" --> DB
    Orders -- "10. Status: DONE" --> History[Quote History]
    History -- "11. Action: Re-calculate/Duplicate" --> Calc
```

---

## 3. Technical Stack Breakdown

| Category | Technology | Usage in Project |
| :--- | :--- | :--- |
| **Languages** | TypeScript | Type-safe logic for both Frontend and Electron Main process. |
| **Frontend** | [React 18](https://react.dev/) | Component-based UI using Vite as the build tool. |
| **Styling** | Tailwind CSS + Shadcn UI | Modern, responsive design system. |
| **State** | TanStack Query | Manages async server state and browser-based data syncing. |
| **Desktop** | [Electron](https://www.electronjs.org/) | Bridges the web app with physical printer hardware. |
| **Database** | Local Storage | All user data persists locally without a central server. |
| **Protocols** | MQTT + FTP | Used for low-latency communication with 3D printers. |

---

## 4. Key Feature & Button Logic

| Feature/Button | Source | Logical Action (The "Closed Loop") |
| :--- | :--- | :--- |
| **G-code Analysis** | `Index.tsx` | Parses file metadata -> Updates Weight -> Triggers Price Refresh in real-time. |
| **Save Quote** | `QuoteSummary` | Validates calculation -> Persists to DB -> Automatically appears in Kanban board. |
| **Drag & Drop Job** | `PrintManagement` | Assigns job to machine -> Re-calculates total remaining time via Capacity Planner. |
| **Duplicate/Re-calculate**| `SavedQuotes` | Fetches historical price/material -> Feeds parameters BACK into the main calculator. |
| **Material Update** | `Settings.tsx` | Updating a price cascades through all "Draft" calculations immediately. |

---

## 5. Core Responsibilities

- **Renderer Process (Frontend)**: Handles all UI/UX, cost calculations (`/src/lib/quoteCalculations.ts`), and slicer file parsing.
- **Main Process (Backend)**: Handles OS-level tasks like writing to the file system, opening network sockets for printer communication, and window management.

---
*Generated by Antigravity*
