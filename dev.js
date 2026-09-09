import { spawn } from 'child_process';

console.log('--- Memulai Backend Server (Express: port 3001) ---');
const server = spawn('node --watch server/index.js', { 
  stdio: 'inherit', 
  shell: true 
});

console.log('--- Memulai Frontend (Vite: port 5173) ---');
const vite = spawn('npx vite', { 
  stdio: 'inherit', 
  shell: true 
});

const cleanup = () => {
  try { server.kill(); } catch (e) {}
  try { vite.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
