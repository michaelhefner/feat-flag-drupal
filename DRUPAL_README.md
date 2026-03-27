# Integrating Version Builder with a Drupal Theme

This guide explains how to integrate the `version-builder` project into a Drupal theme to manage versioned CSS and JavaScript assets.

### 1. Place Your Project Inside Your Drupal Theme

Move your entire `version-builder` project into a subdirectory within your Drupal theme. For example:

```
/themes/custom/my_theme/
├── my_theme.info.yml
├── my_theme.libraries.yml
├── my_theme.theme
├── css/
├── js/
├── templates/
└── version-builder/  <-- Your project goes here
    ├── src/
    ├── build/
    ├── scripts/
    ├── package.json
    └── ...
```

### 2. The Build Process

Your build process remains the same. You will navigate into the `version-builder` directory and run the build command:

```bash
cd /path/to/your/theme/version-builder
npm run build
```

This will generate the versioned assets and the `manifest.json` inside `/themes/custom/my_theme/version-builder/build/`.

### 3. Integrate with Drupal's Library System

This is the most critical part. You need to make Drupal aware of your versioned files. You'll do this by dynamically reading the `manifest.json` and telling Drupal which files to load.

**A. Define a placeholder library in `my_theme.libraries.yml`:**

Create a library entry that you will override dynamically.

```yaml
# my_theme.libraries.yml
versioned-assets:
  js:
    # This is just a placeholder. It will be replaced.
    js/placeholder.js: {}
  css:
    # This is just a placeholder. It will be replaced.
    theme:
      css/placeholder.css: {}
```

**B. Read the manifest and alter the library in `my_theme.theme`:**

You'll use a hook, like `hook_page_attachments_alter`, to read your `manifest.json` and swap out the placeholder assets with the real, versioned ones.

```php
<?php
// my_theme.theme

/**
 * Implements hook_page_attachments_alter().
 */
function my_theme_page_attachments_alter(array &$attachments) {
  // 1. Decide which version to load.
  // This is where your feature flagging logic goes. For example, you could use a query
  // parameter, a config setting, or check the user's role.
  // For this example, we'll just load the 'latest_version'.
  $version_to_load = NULL;

  // 2. Read and parse the manifest.json.
  $manifest_path = \Drupal::service('extension.path.resolver')->getPath('theme', 'my_theme') . '/version-builder/build/manifest.json';
  if (file_exists($manifest_path)) {
    $manifest = json_decode(file_get_contents($manifest_path), TRUE);

    // Get the version key from your logic.
    $version_to_load = $manifest['latest_version']; // Or get from a feature flag service.

    if (isset($manifest['versions'][$version_to_load])) {
      $assets = $manifest['versions'][$version_to_load];

      // 3. Dynamically override the library definition.
      // The key 'my_theme/versioned-assets' matches the library defined in your .libraries.yml file.
      $attachments['#attached']['library']['my_theme/versioned-assets'] = [
        'js' => [
          // The path is relative to your Drupal root.
          'themes/custom/my_theme/version-builder/build' . $assets['main.js'] => [],
        ],
        'css' => [
          'theme' => [
            'themes/custom/my_theme/version-builder/build' . $assets['style.css'] => [],
          ],
        ],
      ];
    }
  }
}
```

### 4. Attach the Library in Your Twig Templates

Finally, in your Drupal theme's Twig templates (e.g., `page.html.twig`), you attach the library as you normally would.

```twig
{# templates/page.html.twig #}

{{ attach_library('my_theme/versioned-assets') }}

<div class="page-content">
  ...
</div>
```

### Summary of the Workflow

1.  You work on your assets inside the `version-builder/src` directory.
2.  You run `npm run build` to create a new, versioned set of assets and update the `manifest.json`.
3.  When a user visits your Drupal site, the `my_theme.theme` file reads the manifest, determines which version to show based on your feature flagging logic, and tells Drupal the exact CSS and JS files to load for that version.
4.  Drupal attaches those specific, versioned files to the page.

This approach gives you a robust, automated versioning system that integrates cleanly with Drupal's own asset management system.
