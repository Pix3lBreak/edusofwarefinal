/**
 * Project ZIP Exporter for 1-Click Vercel Deployment
 * Packages all source files and configuration into a downloadable .zip
 * Supports File System Access API and robust blob URL fallback
 */

import JSZip from 'jszip';

export class ZipExporterService {
  private static async saveBlob(blob: Blob, filename: string): Promise<void> {
    // 1. Try File System Access API (Native OS Save Dialog, bypasses iframe sandbox restrictions)
    try {
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Archivo ZIP del Proyecto',
              accept: { 'application/zip': ['.zip'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // User intentionally cancelled the dialog
      // Fall through to anchor tag below
    }

    // 2. Standard Blob ObjectURL anchor trigger
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1500);
  }

  public static async downloadProjectZip(): Promise<void> {
    const filename = `EduControl_Proyecto_Vercel_${new Date().toISOString().slice(0, 10)}.zip`;

    // Priority 1: Fetch the pre-built, verified, complete physical ZIP from the server
    try {
      const response = await fetch('/EduControl_Proyecto_Vercel.zip');
      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 20000) {
          await this.saveBlob(blob, filename);
          return;
        }
      }
    } catch {
      // Fallback to client generation below
    }

    // Priority 2: Generate on-the-fly with JSZip
    const zip = new JSZip();

    // Vite glob import of ALL project files as raw text:
    const sourceFiles = import.meta.glob(
      [
        '/src/*',
        '/src/**/*',
        '/index.html',
        '/package.json',
        '/vite.config.ts',
        '/tsconfig.json',
        '/vercel.json',
        '/.gitignore',
        '/metadata.json'
      ],
      { query: '?raw', import: 'default', eager: true }
    );

    for (const [path, content] of Object.entries(sourceFiles)) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      if (typeof content === 'string') {
        zip.file(cleanPath, content);
      }
    }

    const readmeContent = `# EduControl - Sistema Integral de Gestión Educativa
Listo para desplegar en Vercel.

## Cómo desplegar en Vercel:
1. Sube esta carpeta a GitHub (https://github.com/new).
2. Conéctala en https://vercel.com/new
3. ¡Listo! Vercel ejecutará npm run build y publicará tu aplicación.
`;

    zip.file('README.md', readmeContent);

    const blob = await zip.generateAsync({ type: 'blob' });
    await this.saveBlob(blob, filename);
  }
}
