# FinSight Analytics

> Advanced Financial Analytics and Insights Platform

## Overview

FinSight is a modern web application built for financial data analysis and visualization. It provides powerful analytics tools, interactive dashboards, and AI-powered insights to help businesses make data-driven financial decisions.

## Features

- **Interactive Dashboards** - Real-time financial data visualization with customizable KPI cards
- **Advanced Analytics** - Comprehensive data analysis with multiple chart types and metrics
- **AI Chat Assistant** - Intelligent chatbot for natural language queries and insights
- **Data Upload & Processing** - Support for importing and processing financial datasets
- **Dynamic Filtering** - Powerful filter panel for drilling down into specific data segments
- **Data Grid** - Interactive tables for detailed data exploration
- **Responsive Design** - Fully responsive UI that works across desktop and mobile devices

## Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router v6
- **Form Handling:** React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd finsight-ui-new
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   ├── AIChatBot.tsx
│   ├── DataCharts.tsx
│   ├── DataGrid.tsx
│   └── ...
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── Analytics.tsx
│   ├── Login.tsx
│   └── ...
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── data/             # Mock data and constants
```

## Development

### Code Style

This project uses ESLint for code quality and consistency. Run linting before committing:

```sh
npm run lint
```

### Building for Production

Create an optimized production build:

```sh
npm run build
```

The build output will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright © 2025 FinSight Analytics. All rights reserved.

## Contact

For questions or support, please contact the development team.

