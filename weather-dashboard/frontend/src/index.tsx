import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { LoggerProvider } from './contexts/LoggerContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// Clear potentially corrupted cache from storage
function clearCorruptedCache() {
    try {
        // Find all weather-related items
        const keysToCheck = [];

        // Collect keys to check
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('weather') ||
                key.includes('forecast') ||
                key.includes('-weather') ||
                key.includes('current-') ||
                key.includes('hourly-') ||
                key.includes('daily-')
            )) {
                keysToCheck.push(key);
            }
        }

        // Check each key for potential corruption
        let corruptedKeys = 0;
        keysToCheck.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                if (value) {
                    // Try parsing the JSON to see if it's valid
                    JSON.parse(value);
                }
            } catch (error) {
                // If JSON is invalid, remove the corrupted data
                console.warn(`Removing corrupted cache entry: ${key}`);
                localStorage.removeItem(key);
                corruptedKeys++;
            }
        });

        if (corruptedKeys > 0) {
            console.log(`Cleared ${corruptedKeys} corrupted cache entries`);
        }
    } catch (error) {
        console.error('Error cleaning cache:', error);
    }
}

// Run the cache cleanup on startup
clearCorruptedCache();

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <LoggerProvider>
                <App />
            </LoggerProvider>
        </ErrorBoundary>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();