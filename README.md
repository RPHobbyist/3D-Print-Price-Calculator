# 3D Print Price Calculator

A professional, open-source 3D printing price calculator and quote management tool by **Rp Hobbyist**. This application allows users to calculate costs for both FDM and Resin printing, manage materials and machines, and track quotes.

#3dprinting #costcalculator #pricingtool #filament #3dprinter #quotegenerator #maker #additivemanufacturing #priceestimation #printfarm #pricecalcualtorfor3dprint

🔗 **[Visit Rp Hobbyist](https://linktr.ee/RPHobbyist)**

## Features

- **Dual Technology Support**: Separate calculators for FDM (Filament) and Resin (SLA/DLP) printing.
- **Smart Auto-Fill**: Upload G-code (`.gcode`, `.3mf`) or Resin files (`.cxdlpv4`) to automatically extract print time, weight, and volume.
- **Thumbnail Previews**: Visual preview of uploaded 3D files.
- **Inventory Management**: Track costs for Filaments, Resins, and Consumables (gloves, IPA, etc.).
- **Machine Presets**: Store hourly rates and specifications for multiple printers.
- **Quote Dashboard**: Save, view, and export past quotes.
- **Responsive Design**: Built with a mobile-first approach using Shadcn UI.

## Technologies Stack

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime)

## Getting Started

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/RPHobbyist/3D-Print-Price-Calculator.git
    cd 3D-Print-Price-Calculator
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the migration scripts found in the `supabase` folder against your Supabase instance to set up the tables (`materials`, `machines`, `quotes`, `cost_constants`).

5.  **Run Locally**
    ```sh
    npm run dev
    ```
    The app should be running at `http://localhost:8080`.

## Project Structure

- `src/components/`: Reusable UI components.
    - `calculator/`: Specific components for the quote calculator forms.
    - `settings/`: Components for managing inventory (Materials, Machines).
    - `shared/`: Common utility components like `ThumbnailPreview`.
- `src/lib/`: Utility functions and logic.
    - `gcodeParser.ts`: Logic for parsing G-code and 3MF files.
    - `resinFileParser.ts`: Logic for parsing binary resin files.
    - `quoteCalculations.ts`: Core math for pricing formulas.
    - `utils.ts`: General helpers (formatting, visibility toggles).
- `src/hooks/`: Custom React hooks (e.g., `useCalculatorData` for fetching DB data).
- `src/pages/`: Main route pages (Index, Settings, Saved Quotes).

## Contributing

We welcome contributions! If you'd like to improve the code:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

### Key Logic Areas
- **Parsers**: If you want to add support for new file formats, look at `src/lib/gcodeParser.ts`.
- **Pricing Formula**: To adjust how price is calculated, check `src/lib/quoteCalculations.ts`.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by Rp Hobbyist
