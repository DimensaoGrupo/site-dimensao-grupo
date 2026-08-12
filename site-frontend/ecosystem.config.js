// Minimal PM2 config for the HostGator VPS. The whole point of
// src/instrumentation.ts's scheduler poller is that it lives inside the
// same process as `next start` — which means scheduled publishing is only
// as reliable as that process staying up. PM2 with autorestart is what
// covers the "process crashes" half of that; the scheduler's own
// "run-immediately-on-boot" behavior covers the "was down for a while"
// half. Neither one alone is enough.
//
// Usage on the VPS: `npm run build && pm2 start ecosystem.config.js`, then
// `pm2 save` so it survives a VPS reboot (with `pm2 startup` configured
// once per server).
module.exports = {
  apps: [
    {
      name: "site-dimensao-grupo",
      // Runs Next's CLI directly (a JS file with a shebang) instead of
      // going through `npm run start` — one less process in the tree for
      // PM2 to supervise and forward signals to.
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      // Caps restart attempts so a genuinely broken build doesn't spin
      // forever; min_uptime keeps a crash-looping process from burning
      // through that cap in seconds.
      max_restarts: 10,
      min_uptime: "30s",
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        // Uncomment/override if the VPS reverse proxy expects a different
        // port than Next's default 3000.
        // PORT: 3000,
      },
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
