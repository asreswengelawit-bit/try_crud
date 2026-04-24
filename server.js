const http = require('http');
const fs = require('fs').promises;

const PORT = 3000;
const FILE = 'products.json';

// Read products (async)
const readData = async () => {
    try {
        const data = await fs.readFile(FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return []; // if file doesn't exist or is empty
    }
};

// Write products (async)
const writeData = async (data) => {
    await fs.writeFile(FILE, JSON.stringify(data, null, 2));
};

const server = http.createServer(async (req, res) => {

    // GET all products
    if (req.method === 'GET' && req.url === '/products') {
        const products = await readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(products));
    }

    // GET product by ID
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

    // CREATE product
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

    
    if (req.method === 'PUT' && req.url.startsWith('/products/')) {
        const id = req.url.split('/')[2];
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const updateData = JSON.parse(body);
                let products = await readData();

                const index = products.findIndex(p => p.id == id);

                if (index !== -1) {
                    products[index] = { ...products[index], ...updateData };
                    await writeData(products);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(products[index]));
                } else {
                    res.writeHead(404);
                    res.end('Product not found');
                }
            } catch (err) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });

        return;
    }

    
