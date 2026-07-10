module.exports = {
  apps: [
    {
      name: "account_online_frontend",
      script: ".next/standalone/server.js",
      cwd: "./",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "7069",
        HOSTNAME: "0.0.0.0"
      }
    }
  ]
};
