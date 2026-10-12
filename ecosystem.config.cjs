// PM2 config for Secondary Yaza standalone on the VPS.
// Loads all runtime env vars from ~/secondary-yaza/.env via Node's --env-file (Node 22+).
// Start/restart with:  pm2 start ~/secondary-yaza/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'secondary-yaza',
      script: 'dist/server/entry.mjs',
      cwd: '/home/miracle/secondary-yaza',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        HOST: '127.0.0.1',
        PORT: '4322',
      },
    },
  ],
};
