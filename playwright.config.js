const { defineConfig } = require('@playwright/test');

const chromePath = process.env.CHROME_PATH;

const use = {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    viewport: {
        width: 1280,
        height: 900
    }
};

if (chromePath) {
    use.launchOptions = {
        executablePath: chromePath
    };
} else {
    use.channel = 'chrome';
}

module.exports = defineConfig({
    testDir: './tests/ui',
    snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000
    },
    use: use,
    webServer: {
        command: 'python3 -m http.server 4173 --bind 127.0.0.1',
        url: 'http://127.0.0.1:4173/tests/fixtures/smoke.html',
        reuseExistingServer: true,
        timeout: 30 * 1000
    }
});
