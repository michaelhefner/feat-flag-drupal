# Version Builder

This project is a simple versioning system for web assets. It uses Vite to bundle your code, supports Twig templates, and a custom script to automatically increment the version number with each build.

## Development vs. Production

This project has two main modes:

*   **Development (`npm run dev`):** Uses a standard `index.html` file for a fast and reliable development experience with Hot Module Replacement (HMR).
*   **Production Build (`npm run build`):** Uses `index.twig` as the source, compiles it to HTML, and generates versioned assets in the `build/` directory.

## How to Use

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Develop your application:**
    *   Run `npm run dev`.
    *   Make changes to your assets in the `src/` directory.
    *   The browser will automatically update as you save files.

3.  **Prepare for production:**
    *   Modify `index.twig` to structure your final production HTML. You can use Twig syntax here.

4.  **Build a new version:**
    *   When you are ready to create a new version of your assets, run the following command:
    ```bash
    npm run build
    ```

## How the Build Process Works

The `npm run build` command does the following:

1.  **Determines New Version:** It checks for a `build/manifest.json`. If it exists, it increments the `latest_version` number to create a new version. If not, it uses the version from `package.json`. The `package.json` file itself is not modified.
2.  **Builds Assets:** It runs Vite to build and bundle your assets, compiling your `index.twig` file into a final `index.html`.
3.  **Outputs Versioned Files:** The output files are placed in the `build/` directory. The filenames will include the new version number, for example:
    *   `main-0.0.2.js`
    *   `style-0.0.2.css`
4.  **Generates a Manifest:** It creates or updates a `build/manifest.json` file.

## Twig Support

This project uses `vite-plugin-twig-drupal` to compile `.twig` files during the **build process only**. You can write your final production markup in `index.twig` and it will be compiled to `index.html` in the `build` directory.

## Feature Flagging and the Manifest

To support feature flagging systems, the build process generates a `manifest.json` file. This file acts as a single source of truth for your system to look up which assets belong to which version.

Here is an example of the manifest structure:

```json
{
  "versions": {
    "0.0.1": {
      "main.js": "/main-0.0.1.js",
      "style.css": "/style-0.0.1.css"
    },
    "0.0.2": {
      "main.js": "/main-0.0.2.js",
      "style.css": "/style-0.0.2.css"
    }
  },
  "latest_version": "0.0.2"
}
```

Your feature flagging system can consume this file to dynamically load the correct assets for a given version.

## Publishing as an NPM Package

This project is set up to be published as an NPM package. The `files` property in `package.json` is configured to only include the `build` directory when you publish the package.

The `main` entry in `package.json` points to `build/main.js`. After running a build, the actual filename will be versioned (e.g., `build/main-0.0.2.js`). You may need to adjust your package consumption logic to account for the versioned filenames.
