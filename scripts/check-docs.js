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
    '### Fixed',
    '### Changed',
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

function checkChangelogFormat(content) {
    // Normalize line endings and trim content
    const normalizedContent = content.replace(/\r\n/g, '\n').trim();

    // Check if [Unreleased] section exists
    if (!normalizedContent.includes('## [Unreleased]')) {
        console.error('❌ [Unreleased] section is missing in CHANGELOG.md');
        process.exit(1);
    }

    // Extract the [Unreleased] section
    const unreleasedMatch = normalizedContent.match(/## \[Unreleased\]([\s\S]*?)(?=##|$)/);
    if (!unreleasedMatch) {
        console.error('❌ Unable to parse [Unreleased] section in CHANGELOG.md');
        process.exit(1);
    }

    const unreleasedContent = unreleasedMatch[1].trim();

    // Check for required subsections
    const requiredSections = ['### Added', '### Changed', '### Fixed', '### Pending Implementation'];
    const missingSections = requiredSections.filter(section => !unreleasedContent.includes(section));

    if (missingSections.length > 0) {
        console.error('❌ [Unreleased] section is missing required subsections in CHANGELOG.md:');
        missingSections.forEach(section => console.error(`   - ${section}`));
        process.exit(1);
    }

    // Check if each section has content
    const sections = unreleasedContent.split('###').slice(1);
    const emptySections = sections.filter(section => {
        const [title, ...content] = section.split('\n');
        return content.join('\n').trim().length === 0;
    });

    if (emptySections.length > 0) {
        console.error('❌ The following sections in CHANGELOG.md are empty:');
        emptySections.forEach(section => {
            const title = section.split('\n')[0].trim();
            console.error(`   - ${title}`);
        });
        process.exit(1);
    }

    // Check if it's the first section in the file
    if (!normalizedContent.startsWith('# Weather Dashboard Changelog\n\n## [Unreleased]')) {
        console.error('❌ [Unreleased] should be the first section after the title in CHANGELOG.md');
        process.exit(1);
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
    checkSections(changelogContent, CHANGELOG_SECTIONS, 'CHANGELOG.md');
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