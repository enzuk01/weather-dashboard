/**
 * Print utilities for the weather dashboard
 */

import '../styles/print.css';

/**
 * Prepares the layout for printing by adding print-specific classes
 */
export const preparePrintLayout = (): void => {
    // Mark sections for current weather, hourly forecast, and historical weather
    const currentWeatherSection = document.querySelector('.current-weather');
    const hourlyForecastSection = document.querySelector('.hourly-forecast');
    const historicalWeatherSection = document.querySelector('.historical-weather');

    if (currentWeatherSection) {
        currentWeatherSection.classList.add('print-section');
        currentWeatherSection.setAttribute('data-print-title', 'Current Weather');
    }

    if (hourlyForecastSection) {
        hourlyForecastSection.classList.add('print-section');
        hourlyForecastSection.setAttribute('data-print-title', 'Hourly Forecast');
    }

    if (historicalWeatherSection) {
        historicalWeatherSection.classList.add('print-section');
        historicalWeatherSection.setAttribute('data-print-title', 'Historical Weather');
    }

    // Hide buttons and non-printable elements
    const buttonsToHide = document.querySelectorAll('button:not(.print-visible)');
    buttonsToHide.forEach(button => {
        button.classList.add('print-hidden');
    });

    // Hide inputs
    const inputsToHide = document.querySelectorAll('input');
    inputsToHide.forEach(input => {
        input.classList.add('print-hidden');
    });

    // Add print class to body for CSS targeting
    document.body.classList.add('printing');
};

/**
 * Cleans up the print layout by removing print-specific classes
 */
export const cleanupPrintLayout = (): void => {
    // Remove print-specific classes from sections
    const printSections = document.querySelectorAll('.print-section');
    printSections.forEach(section => {
        section.classList.remove('print-section');
        section.removeAttribute('data-print-title');
    });

    // Show buttons again
    const hiddenButtons = document.querySelectorAll('.print-hidden');
    hiddenButtons.forEach(button => {
        button.classList.remove('print-hidden');
    });

    // Remove print class from body
    document.body.classList.remove('printing');
};

/**
 * Prints the dashboard with an optional custom title
 * @param title The title to display in the print document
 */
export const printDashboard = (title?: string): void => {
    // Save the original page title
    const originalTitle = document.title;

    // Set the print title if provided
    if (title) {
        document.title = title;
    }

    // Prepare the layout for printing
    preparePrintLayout();

    // Trigger the print dialog
    window.print();

    // Cleanup after print dialog is closed
    // Note: This executes immediately, not after the user finishes printing
    cleanupPrintLayout();

    // Restore the original title
    document.title = originalTitle;
};

/**
 * Adds a print button to the specified element
 * @param element The element to add the print button to
 * @param title Optional custom title for the print document
 */
export const addPrintButton = (element: HTMLElement, title?: string): void => {
    const printButton = document.createElement('button');
    printButton.className = 'print-button';
    printButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg> Print`;

    printButton.addEventListener('click', () => {
        printDashboard(title || 'Weather Dashboard');
    });

    element.appendChild(printButton);
};