const assert = require('assert');
const {
  classifyGeminiError,
  normalizeModelName,
  sanitizeErrorMessage,
  getPrimaryModelName,
  getFallbackModelName
} = require('./services/ai/geminiService');

console.log('====================================================');
console.log('STUDYNEX AI INTEGRATION TEST SUITE');
console.log('====================================================');

// Test 1: Model resolution & sanitization
console.log('\n[1] Testing Model Configuration & Normalization...');
assert.strictEqual(normalizeModelName(''), '', 'Empty model should return empty string');
assert.strictEqual(normalizeModelName('models/gemini-3.8-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeModelName('gemini-3.8-flash'), 'gemini-3.8-flash');
console.log('✓ Model normalization passes with valid model.');

// Test 2: Credential & Secret Sanitization
console.log('\n[2] Testing Credential Sanitization...');
const sensitiveText = 'Call failed at https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6 with Bearer AQ.A_1234567890abcdefg';
const sanitized = sanitizeErrorMessage(sensitiveText);
assert(!sanitized.includes('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6'), 'API key must be redacted');
assert(!sanitized.includes('AQ.A_1234567890abcdefg'), 'OAuth token must be redacted');
assert(sanitized.includes('[REDACTED]'), 'Redaction placeholder must be present');
console.log('✓ Secret redaction passes cleanly: no keys or tokens exposed.');

// Test 3: Missing API Key Error Classification
console.log('\n[3] Testing Missing API Key Error Classification...');
const missingKeyError = new Error('Missing key');
missingKeyError.code = 'AI_MISSING_API_KEY';
const missingClassified = classifyGeminiError(missingKeyError);
assert.strictEqual(missingClassified.statusCode, 503);
assert.strictEqual(missingClassified.code, 'AI_MISSING_API_KEY');
assert.strictEqual(missingClassified.retryable, false);
console.log('✓ Missing API key classified as 503 non-retryable with safe message.');

// Test 4: Invalid API Key / Unauthorized Classification
console.log('\n[4] Testing Invalid API Key Error Classification...');
const invalidKeyError = new Error('API key not valid. Please pass a valid API key.');
invalidKeyError.status = 400;
const invalidClassified = classifyGeminiError(invalidKeyError);
assert.strictEqual(invalidClassified.statusCode, 401);
assert.strictEqual(invalidClassified.code, 'AI_AUTH_ERROR');
assert.strictEqual(invalidClassified.retryable, false);

const oauthKeyError = new Error('Request had invalid authentication credentials. Expected OAuth 2 access token');
oauthKeyError.status = 401;
const oauthClassified = classifyGeminiError(oauthKeyError);
assert.strictEqual(oauthClassified.statusCode, 401);
assert.strictEqual(oauthClassified.code, 'AI_AUTH_ERROR');
assert.strictEqual(oauthClassified.retryable, false);
console.log('✓ Invalid API keys and unsupported token types classified as 401 non-retryable.');

// Test 5: Rate Limiting & Quotas (429)
console.log('\n[5] Testing Rate Limit (429) Classification...');
const rateLimitError = new Error('Resource has been exhausted (e.g. check quota).');
rateLimitError.status = 429;
const rateLimitClassified = classifyGeminiError(rateLimitError);
assert.strictEqual(rateLimitClassified.statusCode, 429);
assert.strictEqual(rateLimitClassified.code, 'AI_RATE_LIMIT');
assert.strictEqual(rateLimitClassified.retryable, true);
console.log('✓ Rate limits classified as 429 retryable.');

// Test 6: Model Unavailable (404)
console.log('\n[6] Testing Model Unavailable Classification...');
const modelError = new Error('models/gemini-not-found is not found');
modelError.status = 404;
const modelClassified = classifyGeminiError(modelError);
assert.strictEqual(modelClassified.statusCode, 503);
assert.strictEqual(modelClassified.code, 'AI_MODEL_UNAVAILABLE');
assert.strictEqual(modelClassified.retryable, false);
console.log('✓ Unavailable model classified as 503 non-retryable.');

// Test 7: Network Failures
console.log('\n[7] Testing Network Failure Classification...');
const netError = new Error('fetch failed: ECONNRESET');
const netClassified = classifyGeminiError(netError);
assert.strictEqual(netClassified.statusCode, 504);
assert.strictEqual(netClassified.code, 'AI_NETWORK_ERROR');
assert.strictEqual(netClassified.retryable, true);
console.log('✓ Network connectivity error classified as 504 retryable.');

// Test 8: Transient Upstream Server Errors
console.log('\n[8] Testing Transient Upstream Errors (503)...');
const transientError = new Error('The service is temporarily unavailable');
transientError.status = 503;
const transientClassified = classifyGeminiError(transientError);
assert.strictEqual(transientClassified.statusCode, 503);
assert.strictEqual(transientClassified.code, 'AI_TEMPORARILY_UNAVAILABLE');
assert.strictEqual(transientClassified.retryable, true);
console.log('✓ Upstream server transient error classified as 503 retryable.');

console.log('\n====================================================');
console.log('ALL 8 INTEGRATION TESTS PASSED SUCCESSFULLY!');
console.log('====================================================');
