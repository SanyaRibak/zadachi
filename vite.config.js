import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    {
      name: "development-csp",
      // Vite injects CSS and uses a websocket in development. Production stays strict.
      transformIndexHtml(html) {
        return command === "serve"
          ? html
              .replace("style-src 'self'", "style-src 'self' 'unsafe-inline'")
              .replace(
                "connect-src 'self'",
                "connect-src 'self' ws://127.0.0.1:* ws://localhost:*",
              )
          : html;
      },
    },
  ],
}));
