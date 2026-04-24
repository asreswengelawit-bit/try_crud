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
const server = http.createServer(async (req, res) => {


    if (req.method === 'GET' && req.url.startsWith('/products/')) {
        const id = req.url.split('/')[2];
        const products = await readData();
        const product = products.find(p => p.id == id);

        if (product) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(product));
        } else {
            res.writeHead(404);
            return res.end('Product not found');
        }
    }

    if (req.method === 'POST' && req.url === '/products') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const newProduct = JSON.parse(body);
                const products = await readData();

                newProduct.id = Date.now();
                products.push(newProduct);

                await writeData(products);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newProduct));
            } catch (err) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });

        return;
    }