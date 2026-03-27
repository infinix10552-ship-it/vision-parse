import fs from 'fs-extra';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'backend', 'public');

async function postBuild() {
  try {
    console.log('🚀 Starting post-build process...');
    
    // Check if dist exists
    if (!fs.existsSync(distDir)) {
      console.error('❌ Error: "dist" directory not found. Run "npm run build" first.');
      process.exit(1);
    }

    // Clean public directory in backend
    if (fs.existsSync(publicDir)) {
      console.log('🧹 Cleaning existing backend/public directory...');
      await fs.remove(publicDir);
    }

    // Copy dist to backend/public
    console.log('📦 Copying "dist" to "backend/public"...');
    await fs.copy(distDir, publicDir);
    
    console.log('✅ Post-build complete! Production bundle is ready in backend/public.');
  } catch (err) {
    console.error('❌ Post-build failed:', err);
    process.exit(1);
  }
}

postBuild();
