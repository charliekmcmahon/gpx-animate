# GPX Trail Animator

[![Demo](https://img.shields.io/badge/Demo-Live-blue)](https://gpx-animate.charliemc.au)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)](https://tailwindcss.com/)

Turn boring static GPX files into awesome animated trails on Apple Maps! Perfect for hikers, cyclists, and anyone who loves getting out in nature and wants to see their adventures come to life.

I actually made this for my app, RideMate. It's a motorbike ride tracking app. Check it out at [getridemate.app](https://getridemate.app)

## What it does

- **Upload GPX Files**: Drop in any .gpx file from your GPS watch, phone, or favourite tracking app
- **Beautiful Apple Maps**: See your trail on crisp, detailed maps with standard, satellite, or hybrid views
- **Smooth Animations**: Watch your path draw itself in real-time with buttery-smooth 60fps playback
- **Playback Controls**: Hit play/pause, track your progress, and tweak how long the animation runs
- **Follow-Along Camera**: Let the camera smoothly follow your moving marker for that cinematic feel
- **Customise Everything**:
  - Trail colour and thickness
  - Map style and colour scheme
  - Zoom level and point-of-interest labels
  - Marker shapes and whether to show them
- **Works Everywhere**: Looks great on your computer, tablet, or phone
- **Dark Mode**: Sleek interface that won't hurt your eyes in low light
- **Export Your Creations**: Save your animated maps as images or PDFs to share with mates

## Demo

Have a play with the live demo: [gpx-animate.charliemc.au](https://gpx-animate.charliemc.au)

## What you need to get started yourself

- Node.js 18 or newer
- An Apple MapKit JS token (for the maps to work) – available with an Apple Developer account (paid)


## Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with the shiny new App Router
- **Frontend**: [React 19](https://reactjs.org/) with all the latest hooks
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) for that modern look
- **UI Bits**: [Shadcn/ui](https://ui.shadcn.com/) components
- **Maps**: [Apple MapKit JS](https://developer.apple.com/maps/mapkitjs/) for the good stuff
- **GPX Magic**: [@tmcw/togeojson](https://github.com/tmcw/togeojson) to parse those files
- **Icons**: [Lucide React](https://lucide.dev/) for the pretty pictures

## Tree

```
gpx-animate/
├── src/
│   ├── app/
│   │   ├── layout.js          # Main layout and SEO stuff
│   │   ├── page.js            # The main app page
│   │   ├── globals.css        # Global styles
│   │   └── icon.svg           # Our GPS icon
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   └── lib/
│       └── utils.js           # Handy utility functions
├── public/                    # Static files and assets
├── package.json
├── tailwind.config.js
├── next.config.mjs
└── README.md
```

## Licence

MIT License

---
