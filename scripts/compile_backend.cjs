const fs = require('fs');
const path = require('path');

function getJavaFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getJavaFiles(fullPath));
        } else if (entry.name.endsWith('.java')) {
            results.push('"' + fullPath.split(path.sep).join('/') + '"');
        }
    }
    return results;
}

const options = fs.readFileSync('backend/javac_options.txt', 'utf8').trim();
const files = getJavaFiles('backend/src/main/java');
fs.writeFileSync('backend/javac_compile.txt', options + '\n' + files.join('\n'), 'utf8');
console.log(`Generated javac_compile.txt with ${files.length} source files.`);
