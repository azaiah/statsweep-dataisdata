// Bundles src/ into one page at dist/index.html and copies public/ assets.
import { build } from 'esbuild'
import fs from 'fs'
const BUILD_ID = new Date().toISOString()
const r = await build({ entryPoints: ['src/app.jsx'], bundle: true, minify: true, format: 'iife', write: false, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"', __BUILD_ID__: JSON.stringify(BUILD_ID) }, target: ['es2020'], loader: { '.js': 'jsx' } })
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')
const css = fs.readFileSync('src/styles.css', 'utf8')
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0B1F33">
<meta name="color-scheme" content="dark light">
<title>StatSweep Command Center</title>
<meta name="description" content="Leads, call scripts, pipeline and money for the StatSweep team at DataIsData, in one place.">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">

<link rel="manifest" href="/site.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="StatSweep">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="format-detection" content="telephone=no">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`
fs.rmSync('dist', { recursive: true, force: true }); fs.mkdirSync('dist', { recursive: true })
fs.writeFileSync('dist/index.html', html)
fs.writeFileSync('dist/version.json', JSON.stringify({ v: BUILD_ID }))
for (const f of fs.readdirSync('public')) fs.copyFileSync('public/' + f, 'dist/' + f)
console.log('Built dist/index.html', Math.round(html.length / 1024) + ' KB')
