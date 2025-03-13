# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

# Utilix Cinema

A modern streaming platform for movies and TV shows.

## Deployment Guide

### Setting up GitHub Repository

1. Create a new repository on GitHub
2. Initialize your local repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### Deploying to Cloudflare Pages

1. Log in to your Cloudflare dashboard at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to "Pages" from the sidebar
3. Click "Create a project" and select "Connect to Git"
4. Choose your GitHub account and select your repository
5. Configure your build settings:
   - Project name: `utilix-cinema` (or your preferred name)
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `18` (or higher)
6. Click "Save and Deploy"

### Environment Variables (If Needed)

If your application requires environment variables, you can add them in the Cloudflare Pages dashboard:
1. Go to your project in Cloudflare Pages
2. Navigate to "Settings" > "Environment variables"
3. Add your variables (e.g., Firebase configuration)

## Development

To run the development server:

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
```

This will generate a `dist` folder with your compiled application.
