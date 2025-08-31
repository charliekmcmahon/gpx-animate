# GPX Trail Animator

A web application that transforms static GPX route files into dynamic, customizable animations on interactive Apple Maps.

## Features

- **GPX File Visualization**: Upload any .gpx file to instantly parse and display the GPS track.
- **Interactive Apple Maps**: Render the trail on high-quality Apple Maps with standard, satellite, and hybrid views.
- **Dynamic Animation**: Watch the trail draw itself in real-time with fluid, 60fps animation.
- **Playback Controls**: Includes play/pause functionality and a cinematic "camera follow" mode that keeps the moving marker centered.
- **Full Customization**: Easily adjust the trail's color, thickness, and the overall animation duration.
- **Modern & Responsive UI**: Features a sleek dark mode by default and a design that works seamlessly on any device.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file with your Apple MapKit token:

```
NEXT_PUBLIC_MAPS_TOKEN=your-apple-mapkit-token-here
```

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **Shadcn/ui** - UI components
- **Apple MapKit JS** - Maps
- **@tmcw/togeojson** - GPX parsing
