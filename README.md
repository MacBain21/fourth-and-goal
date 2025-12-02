# Fourth & Goal

An AI-powered ESPN fantasy football assistant with Apple-quality design.

## Features

### Current MVP
- **Home Page**: Clean landing page with branding and CTA
- **Upload Page**: Drag-and-drop screenshot upload with OCR processing
- **Analysis Page**: Displays parsed league data with placeholder AI insights

### Tech Stack
- Next.js 15.5.6 with App Router
- TypeScript
- Tailwind CSS
- Tesseract.js for OCR
- Apple-inspired design system

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## How It Works

1. **Upload Screenshots**: Users upload screenshots from ESPN showing:
   - League settings
   - Current roster
   - Available players on waivers

2. **OCR Processing**: Tesseract.js extracts text from images in-browser

3. **Data Parsing**: Best-effort parsing converts OCR text to structured JSON:
   - Scoring format (PPR, Half PPR, Standard)
   - League size
   - Roster (player names, positions, teams)
   - Available players

4. **Analysis Display**: Shows parsed data with placeholder AI insights

## Project Structure

```
app/
├── layout.tsx          # Root layout with navigation
├── page.tsx            # Home page
├── globals.css         # Global styles with Tailwind
├── upload/
│   └── page.tsx        # Upload & OCR processing
└── analysis/
    └── page.tsx        # Data analysis & insights

components/
└── Navigation.tsx      # Top navigation bar
```

## Next Steps (Future Development)

### API Integration
The analysis page is structured to easily integrate with AI APIs:

```typescript
// TODO: Create API route
// app/api/analyze/route.ts

export async function POST(request: Request) {
  const data = await request.json();

  // Call OpenAI/Anthropic API
  const insights = await generateInsights(data);

  return Response.json(insights);
}
```

### Improved OCR Parsing
Current parsing is best-effort. Improvements needed:
- Better player name/position detection
- Projected points extraction
- More accurate league settings detection
- Support for different ESPN screenshot layouts

### Additional Features
- User authentication
- Save multiple leagues
- Historical data tracking
- Weekly matchup analysis
- Trade analyzer
- Draft assistant

## Design System

### Colors
- Primary: Blue 600 (`#2563eb`)
- Background: Gray 50 (`#f9fafb`)
- Cards: White with subtle shadows

### Components
- Rounded corners: `xl` or `2xl` (12px-16px)
- Shadows: `shadow-sm` to `shadow-xl`
- Hover effects: Smooth transitions (200ms)
- Typography: System font stack (-apple-system)

### Spacing
- Generous white space
- Container max-width: 4xl-6xl
- Padding: 6-8 units (24-32px)

## Notes

- OCR accuracy depends on screenshot quality
- Currently stores data in localStorage (no backend)
- AI insights are placeholder data (TODO: wire to API)
