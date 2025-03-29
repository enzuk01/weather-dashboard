module.exports = {
    apps: [
        {
            name: 'weather-dashboard-backend',
            script: './backend/app.py',
            interpreter: './venv/bin/python',
            args: '--no-debug',
            cwd: __dirname,
            watch: false,
            env: {
                PORT: 5003,
                FLASK_APP: 'app.py',
                FLASK_ENV: 'production',
                FLASK_DEBUG: 0
            },
            exp_backoff_restart_delay: 100,
            max_restart_tries: 5,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/backend-error.log',
            out_file: './logs/backend.log',
            kill_timeout: 5000
        },
        {
            name: 'weather-dashboard-frontend',
            script: 'npm',
            args: 'start',
            cwd: './frontend',
            watch: false,
            env: {
                PORT: 3000,
                BROWSER: 'none',
                DISABLE_ESLINT_PLUGIN: true,
                TSC_COMPILE_ON_ERROR: true,
                ESLINT_NO_DEV_ERRORS: true,
                SKIP_PREFLIGHT_CHECK: true
            },
            exp_backoff_restart_delay: 100,
            max_restart_tries: 5,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend.log',
            kill_timeout: 5000
        }
    ]
};