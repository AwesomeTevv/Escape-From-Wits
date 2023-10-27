import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        levelOne: resolve(__dirname, "levels/First-Year/First-Year.html"),
        levelTwo: resolve(__dirname, "levels/Second-Year/Second-Year.html"),
        levelThree: resolve(__dirname, "levels/Third-Year/Third-Year.html"),
      },
      output: {
        // Set the output directory to 'dist' or any directory of your choice
        dir: "dist",
        // Keep all files in the 'assets' folder and subfolders
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  publicDir: "assets", // Define the public directory where your assets are located
});
