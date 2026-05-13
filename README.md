# Tina Boettger Website

Personal website for Tina Boettger with a routed Inner Compass subpage and agent-readable metadata assets.

## Local Development

1. Install dependencies:
   `npm.cmd install`

2. Start the development server:
   `npm.cmd run dev`

3. Open:
   `http://localhost:3000/`

## Build For FTP Upload

1. Build the static site:
   `npm.cmd run build`

2. Upload only the contents of the `dist` folder to the web root of the FTP server.

Do not upload `src`, `node_modules`, old source folders, scan files, or the project root itself. The server only needs the built HTML, CSS, JavaScript, images, and public files inside `dist`.

## Route Support

The build includes an Apache `.htaccess` file so direct links like `/inner-compass` can load the React app on standard Apache hosting. Keep `.htaccess` when uploading to FTP.
