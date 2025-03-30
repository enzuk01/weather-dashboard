import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-6 relative"
        >
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Search city or location..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full py-3 px-4 pl-10 bg-white/20 backdrop-blur-lg
                     border border-white/30 rounded-full shadow-lg
                     text-white placeholder:text-white/70
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <svg
                    className="absolute left-3 w-5 h-5 text-white/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <button
                    type="submit"
                    className="absolute right-3 bg-blue-500 hover:bg-blue-600
                     text-white px-4 py-1 rounded-full transition-colors
                     shadow-md"
                >
                    Search
                </button>
            </div>
        </form>
    );
};

export default SearchBar;