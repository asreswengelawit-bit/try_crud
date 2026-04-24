const http = require('http');
const fs = require('fs').promises;

const PORT = 3000;
const FILE = 'products.json';


const readData = async () => {
    try {
        const data = await fs.readFile(FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};


const writeData = async (data) => {
    await fs.writeFile(FILE, JSON.stringify(data, null, 2));
};