import * as fs from 'fs';

interface FileItem {
    name: string;
    description: string;
    repo: string;
    npm: string;
    icon: string;
    github: string;
    website: string;
    category: string;
    type: string;
    downloads: number;
    stars: number;
    tags: string[];
    'dependency-type': string;
    'module-options': string;
    isLayer: boolean;
}

// Read the file contents
const fileContents = fs.readFileSync('content.json', 'utf-8');

// Parse the file contents as JSON
let data: FileItem = {
    name: '',
    description: '',
    repo: '',
    npm: '',
    icon: '',
    github: '',
    website: '',
    category: '',
    type: '',
    downloads: 0,
    stars: 0,
    tags: [],
    'dependency-type': '',
    'module-options': '',
    isLayer: false
};

try {
    data = JSON.parse(fileContents);
} catch (error) {
    console.error('Error parsing JSON:', error);
}

// Extract the specified fields
const {
    name,
    description,
    repo,
    npm,
    icon,
    github,
    website,
    category,
    type,
    downloads,
    stars,
    tags,
    'dependency-type': dependencyType,
    'module-options': moduleOptions,
    isLayer,
} = data;

// Create an object with the extracted fields
const extractedData = {
    name,
    description,
    repo,
    npm,
    icon,
    github,
    website,
    category,
    type,
    downloads,
    stars,
    tags,
    'dependency-type': dependencyType,
    'module-options': moduleOptions,
    isLayer,
};

// Convert the extracted data to JSON string
const extractedFileContents = JSON.stringify(extractedData, null, 2);

// Write the extracted data to a new file
fs.writeFileSync('newContent.json', extractedFileContents, 'utf-8');