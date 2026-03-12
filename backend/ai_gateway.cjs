const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;
const TARGET_AI_SERVER = 'http://localhost:5007';

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Simple logging
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[\x1b[33m${timestamp}\x1b[0m] ${req.method} ${req.url}`);
    next();
});

// Proxy
const proxyOptions = {
    target: TARGET_AI_SERVER,
    changeOrigin: true,
    pathRewrite: { '^/ai-vision': '' },
    ws: true,
    proxyTimeout: 300000,
    timeout: 300000,
    on: {
        error: (err, req, res) => {
            console.error(`\n[\x1b[31m${new Date().toLocaleTimeString()}\x1b[0m] 🛑 ERROR: ${err.message}`);
            if (!res.headersSent) {
                if (err.code === 'ECONNREFUSED') {
                    res.status(503).json({ error: "AI Engine offline" });
                } else {
                    res.status(502).json({ error: err.message });
                }
            }
        }
    }
};

app.use('/', createProxyMiddleware(proxyOptions));

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n\x1b[36m%s\x1b[0m', '╔════════════════════════════════════════════════════╗');
    console.log('\x1b[36m%s\x1b[0m', '║  AI GATEWAY ACTIVE                                 ║');
    console.log('\x1b[36m%s\x1b[0m', `║  Port: ${PORT}  →  AI Engine: 5007                    ║`);
    console.log('\x1b[36m%s\x1b[0m', '╚════════════════════════════════════════════════════╝\n');
});
