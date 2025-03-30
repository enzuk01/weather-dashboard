import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-12 py-4 text-center text-white/70 text-sm">
            <p>
                Weather Dashboard v1.5.0 | &copy; {new Date().getFullYear()} |
                <a
                    href="https://github.com/yourusername/weather-dashboard"
                    className="ml-1 text-blue-300 hover:text-blue-200 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
            </p>
        </footer>
    );
};

export default Footer;