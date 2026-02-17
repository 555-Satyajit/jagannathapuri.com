module.exports = {
    apps: [{
        name: "jay-subhdra-server",
        script: "./server.js",
        instances: "max",
        exec_mode: "cluster",
        watch: false,
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        },
        log_date_format: "YYYY-MM-DD HH:mm Z",
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        merge_logs: true,
    }]
};
