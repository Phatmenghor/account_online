module.exports = {
  apps: [
    {
      name: "account-online-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 7069",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 7069,
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
};
