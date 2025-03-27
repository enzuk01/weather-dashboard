const fs = require('fs');
const path = require('path');

const WEATHER_DASHBOARD_DIR = path.join(process.cwd(), 'weather-dashboard');

const REQUIRED_FILES = [
    ['CHANGELOG.md', 'weather-dashboard/CHANGELOG.md'],
    ['WEATHER_DASHBOARD_PLAN.md', 'WEATHER_DASHBOARD_PLAN.md'],
    ['README.md', 'README.md']
];

const CHANGELOG_SECTIONS = [
    '## [Unreleased]',
    '### Added',
    '### Changed',
    '### Fixed',
    '### Pending Implementation'
];

const PLAN_SECTIONS = [
    '## Development Status Key',
    '## Next Development Focus',
    '## Completed in Last Sprint'
];

function checkFileExists(filePaths) {
    for (const filePath of (Array.isArray(filePaths) ? filePaths : [filePaths])) {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }
    console.error(`❌ Required file missing: ${Array.isArray(filePaths) ? filePaths.join(' or ') : filePaths}`);
    process.exit(1);
}

function checkSections(content, requiredSections, fileName) {
    const missingSections = requiredSections.filter(section => !content.includes(section));
    if (missingSections.length > 0) {
        console.error(`❌ Missing required sections in ${fileName}:`);
        missingSections.forEach(section => console.error(`   - ${section}`));
        process.exit(1);
    }
}

function validateChangelogSection(section, sectionName) {
    const lines = section.split('\n').filter(line => line.trim());

    // Check if section has any content
    if (lines.length === 0) {
        return `Section "${sectionName}" is empty`;
    }

    // Check if all entries start with "-"
    const invalidEntries = lines.filter(line => !line.trim().startsWith('-'));
    if (invalidEntries.length > 0) {
        return `Section "${sectionName}" contains invalid entries. All entries must start with "-":\n${invalidEntries.map(line => `   ${line}`).join('\n')}`;
    }

    return null;
}

function checkChangelogFormat(content) {
    // Normalize line endings and trim content
    const normalizedContent = content.replace(/\r\n/g, '\n').trim();

    // Check if file starts with the correct header
    if (!normalizedContent.startsWith('# Weather Dashboard Changelog')) {
        console.error('❌ CHANGELOG.md must start with "# Weather Dashboard Changelog"');
        process.exit(1);
    }

    // Check if [Unreleased] section exists and is the first section
    const firstSectionMatch = normalizedContent.match(/^# Weather Dashboard Changelog\n+## \[([^\]]+)\]/m);
    if (!firstSectionMatch || firstSectionMatch[1] !== 'Unreleased') {
        console.error('❌ First section after the title must be "## [Unreleased]"');
        process.exit(1);
    }

    // Extract the [Unreleased] section
    const unreleasedMatch = normalizedContent.match(/## \[Unreleased\]([\s\S]*?)(?=\n## \[|$)/);
    if (!unreleasedMatch) {
        console.error('❌ Unable to parse [Unreleased] section');
        process.exit(1);
    }

    const unreleasedContent = unreleasedMatch[1].trim();
    const sections = {
        'Added': null,
        'Changed': null,
        'Fixed': null,
        'Pending Implementation': null
    };

    // Extract each subsection with more lenient whitespace handling
    Object.keys(sections).forEach(sectionName => {
        const sectionRegex = new RegExp(`### ${sectionName}([\\s\\S]*?)(?=### |$)`, 'g');
        const sectionMatch = sectionRegex.exec(unreleasedContent);
        if (sectionMatch) {
            sections[sectionName] = sectionMatch[1].trim();
        }
    });

    // Validate each section
    const errors = [];
    Object.entries(sections).forEach(([name, content]) => {
        if (!content) {
            errors.push(`Missing or empty section "### ${name}"`);
        } else {
            const validationError = validateChangelogSection(content, name);
            if (validationError) {
                errors.push(validationError);
            }
        }
    });

    if (errors.length > 0) {
        console.error('❌ CHANGELOG.md format errors:');
        errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
    }

    // Check for proper spacing between sections
    const properSpacing = unreleasedContent.split('###').every((section, index) => {
        if (index === 0) return true; // Skip first split result
        const trimmed = section.trim();
        return section.startsWith(' ') && (section.endsWith('\n\n') || section.endsWith('\n'));
    });

    if (!properSpacing) {
        console.warn('⚠️ Consider adding consistent spacing between sections in CHANGELOG.md');
    }
}

function checkPlanUpdates(content) {
    // Check if there are any ongoing tasks
    const inProgressCount = (content.match(/\[-\]/g) || []).length;
    const completedCount = (content.match(/\[x\]/g) || []).length;

    if (inProgressCount === 0) {
        console.warn('⚠️ No tasks marked as in-progress [-] in WEATHER_DASHBOARD_PLAN.md');
    }

    // Check if Completed in Last Sprint is up to date (has recent items)
    const lastSprintSection = content.match(/## Completed in Last Sprint([\s\S]*?)(?=##|$)/);
    if (!lastSprintSection || !lastSprintSection[1].trim()) {
        console.error('❌ Completed in Last Sprint section is empty in WEATHER_DASHBOARD_PLAN.md');
        process.exit(1);
    }
}

// Main execution
try {
    // Check if all required files exist and get their paths
    const filePaths = {};
    REQUIRED_FILES.forEach(([name, path]) => {
        filePaths[name] = checkFileExists(path);
        console.log(`✅ Found ${name}`);
    });

    // Read and check CHANGELOG.md
    const changelogContent = fs.readFileSync(filePaths['CHANGELOG.md'], 'utf8');
    checkChangelogFormat(changelogContent);
    console.log('✅ CHANGELOG.md format is valid');

    // Read and check WEATHER_DASHBOARD_PLAN.md
    const planContent = fs.readFileSync(filePaths['WEATHER_DASHBOARD_PLAN.md'], 'utf8');
    checkSections(planContent, PLAN_SECTIONS, 'WEATHER_DASHBOARD_PLAN.md');
    checkPlanUpdates(planContent);
    console.log('✅ WEATHER_DASHBOARD_PLAN.md format is valid');

    console.log('✅ All documentation checks passed!');
    process.exit(0);
} catch (error) {
    console.error('❌ Error during documentation check:', error.message);
    process.exit(1);
}