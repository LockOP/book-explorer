# Book Explorer

A modern, responsive web application for browsing, searching, and exploring books using the Open Library API. Built with React, TypeScript, and Redux Toolkit, featuring real-time notifications, favorites management, and a beautiful dark/light theme.

**Live Demo**: [https://lockop.github.io/book-explorer/](https://lockop.github.io/book-explorer/)

**Author**: Arul Madhava - [madhavaarul@gmail.com](mailto:madhavaarul@gmail.com)

![Book Explorer Screenshot](./public/screenshot.png)

## 🚀 Features

### Core Functionality
- **Book Search & Browse**: Search books by title or author using the Open Library API
- **Grid/List View**: Toggle between grid and list layouts for different browsing experiences
- **Advanced Sorting**: Sort by popularity, title, publish year (newest/oldest), or random
- **Book Details**: Click any book to view comprehensive details in a modal
- **Real-time Search**: Debounced search with instant results

### Enhanced Features
- **Favorites System**: Save books to a local favorites list with persistent storage
- **Real-time Notifications**: Polling mechanism for live updates with toast notifications
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **URL State Management**: Shareable URLs with search state preservation
- **Loading States**: Smooth loading indicators and skeleton image loading

### Technical Highlights
- **TypeScript**: Type safety throughout the application
- **Redux Toolkit**: Centralized state management
- **Tailwind CSS**: Utility-first styling with custom design system
- **Webpack**: Custom build configuration with hot reloading

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **State Management**: Redux Toolkit, React Redux
- **Styling**: Tailwind CSS, Radix UI components
- **Build Tool**: Webpack 5 with custom configuration
- **HTTP Client**: Axios
- **Notifications**: Sonner toast library
- **Icons**: Lucide React

## 🏗️ Architecture & Design Decisions

### State Management Strategy

- **Complex State**: Manages books, favorites, notifications, UI state, and URL synchronization
- **DevTools**: Enhanced debugging experience with Redux DevTools
- **Performance**: Optimized re-renders with useSelector and useDispatch
- **Scalability**: Easy to add new features without prop drilling

### Component Architecture
- **Atomic Design**: Components are organized by complexity (ui → components → pages)
- **Composition over Inheritance**: Reusable UI components with variant props
- **Separation of Concerns**: Business logic in hooks, presentation in components

### API Integration
- **Open Library API**: Chosen for its comprehensive book database and free access
- **Error Handling**: Graceful fallbacks for missing data (cover images, descriptions)
- **Caching**: Redux store acts as a client-side cache
- **Debouncing**: Prevents excessive API calls during search

### Real-time Features
- **Polling**: Implemented for notifications to simulate real-time updates
- **Web Notifications**: Fallback to in-app toasts for better UX

## 🎯 Key Challenges & Solutions

### 1. API Data Inconsistency
**Challenge**: Open Library API returns inconsistent data structures and missing fields.
**Solution**: 
- Comprehensive TypeScript interfaces with optional fields
- Fallback components for missing data (DefaultCoverIcon)
- Data normalization in the service layer

### 2. URL State Synchronization
**Challenge**: Keeping URL parameters in sync with application state.
**Solution**:
- Custom `useUrlState` hook for bidirectional sync
- URL updates on search/sort changes
- State restoration on page refresh

### 3. Responsive Design
**Challenge**: Creating a seamless experience across all device sizes.
**Solution**:
- Mobile-first CSS approach
- Adaptive sidebar behavior (overlay on mobile)
- Flexible grid system with responsive breakpoints

### 4. Performance Optimization
**Challenge**: Handling large book lists without performance degradation.
**Solution**:
- Debounced search to reduce API calls
- Efficient Redux selectors with memoization
- Lazy loading of book details
- Optimized re-renders with React.memo

### 5. Real-time Notifications
**Challenge**: Implementing a realistic long-polling system.
**Solution**:
- Custom polling hook with configurable intervals
- Background polling with visibility API
- Graceful error handling and retry logic

## 🚀 Getting Started

Try the application online: [https://lockop.github.io/book-explorer/](https://lockop.github.io/book-explorer/)

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/book-explorer.git
   cd book-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   The application will automatically open in your default browser [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with hot reload (development mode)
- `npm run build` - Build optimized production files to `dist/` folder (configured for GitHub Pages)
- `npm run build:local` - Build optimized production files for local serving
- `npm run serve:local` - Serve the local build using `npx serve dist`
- `npm run deploy` - Build and deploy to GitHub Pages

### Running Production Build Locally

```bash
npm run build:local  # Create optimized production bundle for local serving
npm run serve:local  # Serve the built files locally
```

**Note**: `build:local` creates a build optimized for local serving, while `build` creates a build optimized for GitHub Pages deployment. Use `build:local` when testing locally to avoid path issues.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── BookCard.tsx    # Individual book display
│   ├── BookGrid.tsx    # Book grid/list container
│   ├── SearchBar.tsx   # Search functionality
│   └── ...
├── store/              # Redux store and slices
│   ├── booksSlice.ts   # Books state management
│   ├── favoritesSlice.ts # Favorites state
│   └── ...
├── hooks/              # Custom React hooks
│   ├── bookPolling.ts  # Long-polling logic
│   ├── debounce.ts     # Debounce utility
│   └── ...
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── config/             # Application configuration
└── lib/                # Utility functions
```

## 🎨 Design System

The application uses a custom design system built on Tailwind CSS:

- **Colors**: Semantic color tokens (primary, secondary, accent)
- **Typography**: Consistent font scales and weights
- **Spacing**: 4px base unit system
- **Components**: Radix UI primitives with custom styling
- **Themes**: Dark/light mode with CSS custom properties

## 🔧 Configuration

### Application Configuration
Key configuration options in `src/config/global.ts`:

- **API Settings**: Base URL, endpoints, timeouts
- **Search**: Default limits, debounce delays
- **UI**: Theme defaults, breakpoints
- **Notifications**: Toast duration, positions

### Build Configuration
The project includes two webpack configurations:

- **`webpack.config.js`**: Main configuration for GitHub Pages deployment
  - Uses `publicPath: "/book-explorer/"` for GitHub Pages compatibility
  - Optimized for production deployment

- **`webpack.config.local.js`**: Local development configuration
  - Uses `publicPath: "./"` for local serving
  - Optimized for testing production builds locally

---

**Author**: Arul Madhava - [madhavaarul@gmail.com](mailto:madhavaarul@gmail.com)

Built with ❤️ using Tailwind CSS