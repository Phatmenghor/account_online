module.exports = {
  apps: [
    {
      name: "account-junior-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 7068",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 7068,
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
};
