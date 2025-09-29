# Marketing Simulator

A visual workflow builder for creating and simulating marketing campaigns. Design complex campaign flows with drag-and-drop nodes, connect steps with conditional transitions, and simulate campaign execution with detailed logging.

🌐 **Live Demo**: [https://marketing-simulator.vercel.app/](https://marketing-simulator.vercel.app/)

## Features

- **Visual Workflow Designer**: Drag-and-drop interface for building campaign flows using ReactFlow
- **Step Types**: Start, SMS, Email, Custom Actions, and End steps
- **Conditional Transitions**: Success/failure paths with validation
- **Real-time Simulation**: Execute workflows and view detailed execution logs
- **Export/Import**: Save and load workflows as JSON files
- **Type-Safe**: Built with TypeScript and Zod validation
- **Modern UI**: Dark theme with TailwindCSS styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:meekot/marketing-simulator.git
cd marketing-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### Creating a Campaign

1. **Set Campaign Details**: Enter a name and description in the header section
2. **Add Steps**: Click the "+" button on any step to add new campaign steps
3. **Connect Steps**: Drag from connection points to create transitions between steps
4. **Edit Properties**: Use the editor panels to configure step details and transition conditions
5. **Simulate**: Switch to the "Journal" tab to run simulations and view execution logs

### Step Types

- **Start**: Entry point for the campaign
- **SMS**: Send SMS messages
- **Email**: Send email messages
- **Custom**: Flexible step for custom actions
- **End**: Termination point for the campaign

### Transitions

Steps can have conditional transitions based on success or failure outcomes, allowing for branching campaign logic.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Workflow UI**: ReactFlow
- **State Management**: Zustand
- **Validation**: Zod
- **Testing**: Vitest with React Testing Library

## Project Structure

```
src/
├── components/          # React components
│   ├── Canvas/         # Workflow canvas and nodes
│   ├── Common/         # Reusable UI components
│   ├── Editor/         # Step and transition editors
│   └── Simulator/      # Execution log and simulation
├── hooks/              # Custom React hooks
├── store/              # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── test/               # Test setup
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.
