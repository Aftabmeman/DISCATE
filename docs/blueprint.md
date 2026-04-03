# **App Name**: Mentur AI

## Core Features:

- User Authentication & Profiles: Enable secure sign-up and login via Firebase Auth (email/password), providing personalized user accounts.
- Study Material Ingestion: Allow users to upload various file formats (PDF, PPT, Images) or paste text directly, with options for custom titles and language selection (English/Hindi).
- AI-Powered Assessment Generation: Leverage Groq's llama-3.1-8b-instant tool to generate diverse academic assessments (MCQ, Flashcard, Essay, Mixed) from ingested study material, configurable by academic level, difficulty, and question count.
- AI Essay Evaluation & Feedback: Provide an AI tool for comprehensive evaluation of typed or handwritten (via OCR) essays, offering scores, detailed strengths, specific weaknesses, actionable improvement roadmaps, and structural model answer outlines.
- Personalized Progress & Performance Tracking: Visualize academic growth through key statistics, accuracy trend charts, and automatically identified weak topics based on assessment data stored in Firestore.
- Assessment History & Review: Maintain a searchable and filterable history of all completed assessments, allowing users to revisit questions, review their answers, and check scores and feedback stored in Firestore.

## Style Guidelines:

- Primary color: A rich, academic purple (#6B4EFF), conveying expertise and focus, as specified.
- Background color: A very subtle, almost white violet (#FAFAFD) provides a clean, understated canvas that softly complements the primary color.
- Accent color: A vibrant cerulean blue (#2E6DD6), analogous to the primary, used to highlight interactive elements and create visual emphasis.
- Sidebar background: A deep, professional navy (#1a1a2e), as specified, offering strong visual separation and depth for navigation.
- Headlines will use 'Space Grotesk' (sans-serif) for a modern, tech-forward, and authoritative presence.
- Body text will use 'Inter' (sans-serif) to ensure excellent readability for longer academic content, questions, and explanations.
- Employ a consistent set of clean, professional, and education-themed icons that visually support navigation and feature identification.
- Implement a responsive grid-based layout for content areas, complemented by a fixed dark navy sidebar for navigation on larger screens, adapting smoothly for mobile devices.
- Incorporate subtle, refined animations for transitions between sections and element interactions, enhancing user engagement without distracting from the academic content.