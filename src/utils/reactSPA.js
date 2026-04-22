// Shared utility for serving the React SPA with CSP nonce injection and GA tags.
// Used by index.js (homepage SSR/SPA) and routes/pages.js (all other public pages).

const path = require('path');
const fs = require('fs');
const { getGoogleAnalyticsTags } = require('./helpers');

const SPA_TEMPLATE = path.join(__dirname, '../../react-homepage/dist/index.html');
let _spaTemplate;

function getSPATemplate() {
  if (!_spaTemplate) {
    _spaTemplate = fs.readFileSync(SPA_TEMPLATE, 'utf-8');
  }
  return _spaTemplate;
}

function stripStaticGoogleAnalytics(html) {
  return html
    .replace(/<!--\s*Google tag \(gtag\.js\)\s*-->\s*/gi, '')
    .replace(/<script[^>]*src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"[^>]*><\/script>\s*/gi, '')
    .replace(/<script[^>]*>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\]\s*;[\s\S]*?gtag\('config'[\s\S]*?<\/script>\s*/gi, '');
}

function addNonceToAllScriptTags(html, nonce) {
  if (!nonce) return html;
  return html.replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`);
}


/**
 * Render the React SPA HTML string with GA tags and CSP nonce injected.
 * @param {string} nonce - CSP nonce from res.locals.nonce
 * @param {string|null} appHtml - Pre-rendered HTML for SSR hydration (null for plain SPA)
 */
function renderReactHtml(nonce = '', appHtml = null) {
  let html = getSPATemplate();

  if (appHtml !== null) {
    html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  }

  html = stripStaticGoogleAnalytics(html);
  html = html.replace('</head>', `${getGoogleAnalyticsTags()}\n  </head>`);
  html = addNonceToAllScriptTags(html, nonce);
  return html;
}

module.exports = { renderReactHtml };
