const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createZip() {
  const zip = new JSZip();
  const rootDir = path.resolve(__dirname, '..');

  const includeFiles = [
    'package.json',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    'vercel.json',
    '.gitignore',
    'metadata.json',
    'firebase-applet-config.json',
    'firebase-blueprint.json',
    'firestore.rules',
    'README.md',
    '.env.example'
  ];

  const includeDirs = ['src', 'public'];

  for (const file of includeFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      zip.file(file, fs.readFileSync(filePath));
    }
  }

  function addDir(dirPath, zipFolder) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item === 'node_modules' || item === 'dist' || item === '.git' || item.endsWith('.zip')) continue;
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addDir(fullPath, zipFolder.folder(item));
      } else {
        zipFolder.file(item, fs.readFileSync(fullPath));
      }
    }
  }

  for (const dir of includeDirs) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      addDir(dirPath, zip.folder(dir));
    }
  }

  zip.file(
    'README.md',
    `# EduControl - Sistema Integral de Gestión Educativa
Listo para desplegar en Vercel.

## Despliegue con Vercel CLI:
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

## O mediante GitHub:
1. Sube este contenido a un nuevo repositorio de GitHub.
2. Impórtalo en https://vercel.com/new
3. ¡Listo!`
  );

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  
  // Save to public/
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  const publicZipPath = path.join(publicDir, 'EduControl_Proyecto_Vercel.zip');
  fs.writeFileSync(publicZipPath, content);

  // Also save to root
  const rootZipPath = path.join(rootDir, 'EduControl_Proyecto_Vercel.zip');
  fs.writeFileSync(rootZipPath, content);

  console.log(`ZIP created successfully at ${publicZipPath} (${(content.length / 1024).toFixed(1)} KB)`);
}

createZip().catch(console.error);
