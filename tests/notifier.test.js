// tests/notifier.test.js
// Unit tests for services/notifier.js
// Run: node --test tests/notifier.test.js

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('events');

function freshNotifier() {
  delete require.cache[require.resolve('../services/notifier')];
  return require('../services/notifier');
}

function mockDnsLookup(impl) {
  const dnsMod = require('dns');
  const original = dnsMod.promises.lookup;
  dnsMod.promises.lookup = impl;
  return () => {
    dnsMod.promises.lookup = original;
  };
}

function mockHttpsRequest(impl) {
  const https = require('https');
  const original = https.request;
  https.request = impl;
  return () => {
    https.request = original;
  };
}

function createHttpsRequestMock(handler) {
  const calls = [];

  const restore = mockHttpsRequest((opts, cb) => {
    calls.push({ opts });

    const req = new EventEmitter();
    req._body = '';

    req.write = (chunk) => {
      req._body += chunk.toString();
    };

    req.end = () => {
      handler({ req, opts, cb });
    };

    req.destroy = (err) => {
      req.emit('error', err || new Error('destroyed'));
    };

    return req;
  });

  return { calls, restore };
}

function respond(cb, statusCode, body = '') {
  const res = new EventEmitter();
  res.statusCode = statusCode;
  cb(res);
  if (body) {
    res.emit('data', Buffer.from(body));
  }
  res.emit('end');
}

describe('validateWebhookUrl', () => {
  test('rejects null', async () => {
    const { validateWebhookUrl } = freshNotifier();
    await assert.rejects(() => validateWebhookUrl(null), /required/i);
  });

  test('rejects non-https URL', async () => {
    const { validateWebhookUrl } = freshNotifier();
    await assert.rejects(
      () => validateWebhookUrl('http://example.com/hook'),
      /must use HTTPS/i
    );
  });

  test('rejects localhost literal', async () => {
    const { validateWebhookUrl } = freshNotifier();
    await assert.rejects(
      () => validateWebhookUrl('https://localhost/hook'),
      /private address/i
    );
  });

  test('rejects IPv4 link-local literal', async () => {
    const { validateWebhookUrl } = freshNotifier();
    await assert.rejects(
      () => validateWebhookUrl('https://169.254.1.5/hook'),
      /private address/i
    );
  });

  test('rejects unparseable URL', async () => {
    const { validateWebhookUrl } = freshNotifier();
    await assert.rejects(() => validateWebhookUrl('not-a-url'), /Invalid webhook URL/i);
  });

  test('rejects hostname that DNS-resolves to private IP', async () => {
    const restoreDns = mockDnsLookup(async () => [{ address: '10.0.0.1', family: 4 }]);
    try {
      const { validateWebhookUrl } = freshNotifier();
      await assert.rejects(
        () => validateWebhookUrl('https://evil.example.com/hook'),
        /private IP/i
      );
    } finally {
      restoreDns();
    }
  });

  test('accepts valid URL and returns pinned connection details', async () => {
    const restoreDns = mockDnsLookup(async () => [{ address: '1.2.3.4', family: 4 }]);
    try {
      const { validateWebhookUrl } = freshNotifier();
      const result = await validateWebhookUrl('https://hooks.example.com/webhook?x=1');

      assert.equal(result.hostname, 'hooks.example.com');
      assert.equal(result.pinnedIp, '1.2.3.4');
      assert.equal(result.parsed.pathname, '/webhook');
      assert.equal(result.parsed.search, '?x=1');
    } finally {
      restoreDns();
    }
  });
});

describe('sendWebhook', () => {
  test('uses pinned IP + host header and sends JSON body', async () => {
    const restoreDns = mockDnsLookup(async () => [{ address: '1.2.3.4', family: 4 }]);
    const httpsMock = createHttpsRequestMock(({ req, cb }) => {
      respond(cb, 204, '');
      assert.deepEqual(JSON.parse(req._body), { hello: 'world' });
    });

    try {
      const notifier = freshNotifier();
      await notifier.sendWebhook('https://hooks.example.com/w?z=1', { hello: 'world' });

      assert.equal(httpsMock.calls.length, 1);
      const opts = httpsMock.calls[0].opts;
      assert.equal(opts.host, '1.2.3.4');
      assert.equal(opts.servername, 'hooks.example.com');
      assert.equal(opts.headers.Host, 'hooks.example.com');
      assert.equal(opts.method, 'POST');
      assert.equal(opts.path, '/w?z=1');
      assert.equal(opts.headers['Content-Type'], 'application/json');
    } finally {
      httpsMock.restore();
      restoreDns();
    }
  });

  test('rejects with status details when upstream returns non-2xx', async () => {
    const restoreDns = mockDnsLookup(async () => [{ address: '8.8.8.8', family: 4 }]);
    const httpsMock = createHttpsRequestMock(({ cb }) => {
      respond(cb, 500, 'internal error happened');
    });

    try {
      const notifier = freshNotifier();
      await assert.rejects(
        () => notifier.sendWebhook('https://hooks.example.com/fail', { x: 1 }),
        /status 500/i
      );
    } finally {
      httpsMock.restore();
      restoreDns();
    }
  });

  test('rejects when URL validation fails and never sends request', async () => {
    const httpsMock = createHttpsRequestMock(({ cb }) => {
      respond(cb, 200, 'ok');
    });

    try {
      const notifier = freshNotifier();
      await assert.rejects(
        () => notifier.sendWebhook('https://127.0.0.1/hook', {}),
        /private address/i
      );
      assert.equal(httpsMock.calls.length, 0);
    } finally {
      httpsMock.restore();
    }
  });
});

describe('sendSlack', () => {
  test('sends Slack attachment format with correct fields', async () => {
    const restoreDns = mockDnsLookup(async () => [{ address: '1.2.3.4', family: 4 }]);
    let parsedBody = null;
    const httpsMock = createHttpsRequestMock(({ req, cb }) => {
      parsedBody = JSON.parse(req._body);
      respond(cb, 200, 'ok');
    });

    try {
      const notifier = freshNotifier();
      await notifier.sendSlack('https://hooks.slack.com/services/T/B/x', {
        metric: 'cpu', value: 92, threshold: 85, serverName: 'basement-core',
      });

      assert.ok(parsedBody, 'request body should be sent');
      assert.ok(parsedBody.text.includes('Cpu'));
      assert.ok(parsedBody.text.includes('basement-core'));
      assert.equal(parsedBody.attachments[0].color, '#FF4444');
      const fields = parsedBody.attachments[0].fields;
      assert.equal(fields.find(f => f.title === 'Current').value, '92%');
      assert.equal(fields.find(f => f.title === 'Threshold').value, '85%');
    } finally {
      httpsMock.restore();
      restoreDns();
    }
  });
});

describe('sendDiscord', () => {
  test('sends Discord embed format with correct fields', async () => {
    const restoreDns = mockDnsLookup(async () => [{ address: '1.2.3.4', family: 4 }]);
    let parsedBody = null;
    const httpsMock = createHttpsRequestMock(({ req, cb }) => {
      parsedBody = JSON.parse(req._body);
      respond(cb, 200, 'ok');
    });

    try {
      const notifier = freshNotifier();
      await notifier.sendDiscord('https://discord.com/api/webhooks/123/abc', {
        metric: 'memory', value: 95, threshold: 90, serverName: 'basement-core',
      });

      assert.ok(parsedBody, 'request body should be sent');
      assert.equal(parsedBody.embeds.length, 1);
      assert.equal(parsedBody.embeds[0].color, 0xFF4444);
      assert.ok(parsedBody.embeds[0].title.includes('Memory'));
      const fields = parsedBody.embeds[0].fields;
      assert.equal(fields.find(f => f.name === 'Current').value, '95%');
      assert.equal(fields.find(f => f.name === 'Threshold').value, '90%');
    } finally {
      httpsMock.restore();
      restoreDns();
    }
  });
});
