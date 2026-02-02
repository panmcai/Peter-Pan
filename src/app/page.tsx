@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Improve readability */
.prose {
  max-width: 65ch;
}

.prose p {
  margin-bottom: 1.5em;
  line-height: 1.75;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.25;
  font-weight: 600;
}

.prose code {
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  background-color: rgba(0, 0, 0, 0.05);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.dark .prose code {
  background-color: rgba(255, 255, 255, 0.1);
}

.prose pre {
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .prose pre {
  background-color: rgba(255, 255, 255, 0.05);
}

.prose pre code {
  padding: 0;
  background-color: transparent;
}

.prose a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose a:hover {
  text-decoration-thickness: 2px;
}
