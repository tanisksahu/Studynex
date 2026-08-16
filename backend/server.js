require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const apiRouter = require('./api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studynex')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', apiRouter);

// Test routes
app.get('/', (req, res) => {
    res.send('Welcome to Studynex!');
});

app.get('/test', (req, res) => {
    res.send('This is a test route for Studynex.');
});

function makeRequest(method, urlString, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(urlString);
        const lib = urlObj.protocol === 'https:' ? https : http;
        const opts = {
            method,
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + (urlObj.search || ''),
            headers: headers
        };

        const req = lib.request(opts, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const contentType = res.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                    catch (err) { resolve({ status: res.statusCode, body: data }); }
                } else {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (body) {
            const payload = typeof body === 'string' ? body : JSON.stringify(body);
            req.write(payload);
        }

        req.end();
    });
}

function extractCourseIdFromLink(link) {
    try {
        const url = new URL(link);
        const parts = url.pathname.split('/').filter(Boolean);
        const coursesIdx = parts.indexOf('courses');
        if (coursesIdx >= 0 && parts.length > coursesIdx + 1) return parts[coursesIdx + 1];
        return parts.length ? parts[parts.length - 1] : url.hostname;
    } catch (e) {
        return link;
    }
}

// POST /api/course/auto-complete
// Body: { link: string, videoCompleteUrlPattern?: string }
// Uses incoming Cookie header (e.g. CAUTH=...) when contacting the origin.
app.post('/api/course/auto-complete', async (req, res) => {
    const { link, videoCompleteUrlPattern } = req.body || {};
    if (!link) return res.status(400).json({ error: 'Missing "link" in request body' });

    const cookieHeader = req.headers.cookie || '';
    const courseId = extractCourseIdFromLink(link);
    let origin = null;
    try { origin = new URL(link).origin; } catch (e) { origin = null; }

    // Attempt to load course items from a conventional endpoint if origin present
    let items = null;
    if (origin) {
        const itemsUrl = `${origin}/api/courses/${courseId}/items`;
        try {
            const resp = await makeRequest('GET', itemsUrl, { Cookie: cookieHeader });
            if (resp.status === 200 && resp.body) items = resp.body.items || resp.body;
        } catch (e) {
            // ignore — we'll fallback to returning instructions
        }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        // Could not fetch items automatically — return instructions and a safe fallback
        return res.json({
            message: 'Could not fetch course items automatically. Provide a videoCompleteUrlPattern or ensure the platform exposes /api/courses/:id/items',
            exampleCurl: `curl -v -X POST "http://localhost:${PORT}/api/course/auto-complete" -H "Content-Type: application/json" -H "Cookie: CAUTH=YOUR_COOKIE" -d '{"link":"${link}","videoCompleteUrlPattern":"https://platform.example/api/videos/{id}/complete"}'`
        });
    }

    // Find video items. Accept common shapes: { id, type } or { id, kind }
    const videoItems = items.filter(it => (it.type && it.type.toLowerCase() === 'video') || (it.kind && it.kind.toLowerCase() === 'video'));
    const results = [];

    for (const v of videoItems) {
        const vid = v.id || v.videoId || v._id;
        if (!vid) { results.push({ item: v, status: 'skipped', reason: 'no-id' }); continue; }

        const completeUrl = videoCompleteUrlPattern ? videoCompleteUrlPattern.replace('{id}', vid) : `${origin}/api/videos/${vid}/complete`;
        try {
            const r = await makeRequest('POST', completeUrl, Object.assign({ 'Content-Type': 'application/json', Cookie: cookieHeader }, {}), { completed: true });
            results.push({ id: vid, status: r.status, response: (r.body && typeof r.body === 'object') ? r.body : String(r.body).slice(0, 200) });
        } catch (err) {
            results.push({ id: vid, status: 'error', reason: String(err).slice(0, 200) });
        }
    }

    return res.json({ courseId, videoCount: videoItems.length, results });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});