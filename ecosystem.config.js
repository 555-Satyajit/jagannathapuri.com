module.exports = {
    apps: [
        {
            name: "jay-subhdra-server",
            script: "./server.js",
            cwd: "./server", // Assumes PM2 is run from the project root
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "development",
                PORT: 5000
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 5000
            },
            log_date_format: "YYYY-MM-DD HH:mm Z",
            error_file: "./logs/server-err.log",
            out_file: "./logs/server-out.log",
            merge_logs: true,
        },
        {
            name: "jay-subhdra-frontend",
            script: "npm",
            args: "start",
            cwd: "./next-frontend", // Run the start script from inside the next-frontend folder
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "development",
                PORT: 3000
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3000
            },
            log_date_format: "YYYY-MM-DD HH:mm Z",
            error_file: "./server/logs/frontend-err.log",
            out_file: "./server/logs/frontend-out.log",
            merge_logs: true,
        }
    ]
};

