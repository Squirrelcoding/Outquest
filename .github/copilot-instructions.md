# OutQuest AI Agent Instructions

## Project Overview
OutQuest is a React Native/Expo mobile app for creating and completing location-based quests, similar to geocaching but more accessible. The app uses Supabase for authentication and data storage.

## Key Architecture Components

### Frontend Structure
- Uses Expo Router (file-based routing) in `/app` directory
- UI components from `@ui-kitten/components` library
- Folder structure:
  - `/app` - Router-based screens and navigation
  - `/components` - Reusable UI components
  - `/context` - React context providers
  - `/lib` - Utility functions and Supabase client
  - `/queries` - SQL queries for Supabase

### Data Flow
1. Authentication handled through `context/Auth.tsx` using Supabase
2. Quest data managed through Supabase with different types:
   - Classic photo quests
   - Location-based quests
   - QR code quests (in development)
   - Path tracking quests (in development)

### Key Integration Points
- Supabase for auth and data (`lib/supabase.ts`)
- Expo Location services for quest locations
- Expo Camera for photo quests
- Edge Functions in `/supabase/functions` for serverless operations

## Development Workflow

### Setup
```bash
npm install
npx expo start
```

### Common Tasks
- Creating a new screen: Add file to `/app` directory following Expo Router conventions
- Adding a new quest type: Create component in `/components` and update quest creation flow
- Database changes: Update types in `database.types.ts`

## Project-Specific Patterns

### Quest Component Structure
See `components/CreateLocationQuest.tsx` for reference implementation:
- State management using React hooks
- Map integration with `react-native-maps`
- Bottom sheet pattern for mobile UI
- Form validation before submission

### Authentication Flow
1. Protected routes under `app/(tabs)`
2. Public routes under `app/(auth)`
3. Use `useAuth()` hook from `context/Auth.tsx` to access session

### Error Handling
- SQL queries contain built-in error checks (see `queries/` directory)
- Use Supabase's error response structure for consistent handling

### Mobile-First Design
- Use `@ui-kitten/components` for consistent UI
- Handle both iOS and Android through platform-specific code when needed
- Implement bottom sheets for complex forms (see `CreateLocationQuest.tsx`)

## Common Pitfalls
- Always handle auth session state loading
- Check location permissions before accessing device location
- Use proper TypeScript types from `database.types.ts`
- Consider offline state handling

## Testing
Currently no automated tests. Manual testing through Expo Go app required.