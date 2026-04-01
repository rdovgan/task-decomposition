# Task Decomposition Tool

An intelligent tool for breaking down complex tasks into manageable subtasks, built with modern web technologies.

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **React 19** - Latest React features

### Backend (Planned)
- **Node.js/Express** - Backend API server
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management

### Infrastructure (Planned)
- **Docker** - Containerized development and deployment
- **GitHub Actions** - CI/CD pipelines

## Project Structure

```
task-decomposition-tool/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions and shared code
│   ├── server/           # Backend code (planned)
│   │   ├── api/          # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   └── models/       # Database models
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
└── tests/                # Test files (to be added)
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (for containerized development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-decomposition-tool
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Setup (Coming Soon)

```bash
# Build the Docker image
docker build -t task-decomposition-tool .

# Run the container
docker run -p 3000:3000 task-decomposition-tool
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Quality

The project uses:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Contributing

This project is being developed as part of the Paperclip team's task decomposition initiative. The Full-Stack Developer role will lead the implementation of the core features.

## License

MIT License - See LICENSE file for details
