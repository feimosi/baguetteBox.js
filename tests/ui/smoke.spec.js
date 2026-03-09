var playwright = require('@playwright/test');
var test = playwright.test;
var expect = playwright.expect;

async function gotoFixture(page) {
    await page.goto('/tests/fixtures/smoke.html');
    await expect(page.locator('.gallery-basic')).toBeVisible();
}

async function openImage(page, selector) {
    await page.locator(selector).click();
    await expect(page.locator('#baguetteBox-overlay')).toBeVisible();
    await expect(page.locator('#baguetteBox-overlay')).toHaveClass(/visible/);
}

async function closeOverlay(page) {
    await page.keyboard.press('Escape');
    await expect(page.locator('#baguetteBox-overlay')).not.toBeVisible();
}

async function expectOverlayScreenshot(page, name) {
    await expect(page).toHaveScreenshot(name, {
        animations: 'disabled',
        caret: 'hide',
        scale: 'css'
    });
}

async function expectBasicIndex(page, expectedIndex) {
    await expect.poll(async function() {
        return page.evaluate(function() {
            var calls = /** @type {any} */ (window).smokeState.basicOnChangeCalls;
            return calls[calls.length - 1].index;
        });
    }).toBe(expectedIndex);
}

test.describe('baguetteBox smoke tests', function() {
    test('opens and closes the overlay from the gallery', async function({ page }) {
        await gotoFixture(page);

        await openImage(page, '#basic-image-1');
        await expect(page.locator('#baguetteBox-figcaption-0')).toHaveText('Golden Gate caption');
        await expectOverlayScreenshot(page, 'overlay-open.png');
        await closeOverlay(page);
        await expectOverlayScreenshot(page, 'overlay-closed.png');
    });

    test('supports button and keyboard navigation in a multi-image gallery', async function({ page }) {
        await gotoFixture(page);

        await openImage(page, '#basic-image-1');
        await expectBasicIndex(page, 0);
        await page.locator('#next-button').click();
        await expectBasicIndex(page, 1);
        await expect(page.locator('#baguetteBox-figcaption-1')).toHaveText('Midnight title');
        await expectOverlayScreenshot(page, 'overlay-second-image.png');

        await page.keyboard.press('ArrowLeft');
        await expectBasicIndex(page, 0);

        await page.keyboard.press('End');
        await expectBasicIndex(page, 2);

        await page.keyboard.press('Home');
        await expectBasicIndex(page, 0);
    });

    test('renders callback-based captions and applies the title attribute', async function({ page }) {
        await gotoFixture(page);

        await openImage(page, '#callback-image-1');
        await expect(page.locator('#baguetteBox-figcaption-0')).toHaveText('CALLBACK CAPTION');
        await expect(page.locator('#baguetteBox-slider img').last()).toHaveAttribute('title', 'CALLBACK CAPTION');
        await expect.poll(async function() {
            return page.evaluate(function() {
                return /** @type {any} */ (window).smokeState.callbackCaptions.length;
            });
        }).toBe(1);
    });

    test('tracks special-gallery lifecycle and hides buttons when configured', async function({ page }) {
        await gotoFixture(page);

        await openImage(page, '#special-image-1');
        await expect(page.locator('#previous-button')).toBeHidden();
        await expect(page.locator('#next-button')).toBeHidden();
        await expect.poll(async function() {
            return page.evaluate(function() {
                var smokeState = /** @type {any} */ (window).smokeState;
                return {
                    htmlOverflow: document.documentElement.style.overflowY,
                    bodyOverflow: document.body.style.overflowY,
                    afterShowCalls: smokeState.afterShowCalls,
                    onChangeCalls: smokeState.onChangeCalls.length
                };
            });
        }).toEqual({
            htmlOverflow: 'hidden',
            bodyOverflow: 'scroll',
            afterShowCalls: 1,
            onChangeCalls: 1
        });

        await closeOverlay(page);
        await expect.poll(async function() {
            return page.evaluate(function() {
                return /** @type {any} */ (window).smokeState.afterHideCalls;
            });
        }).toBe(1);
    });

    test('supports the public show API with an explicit gallery reference', async function({ page }) {
        await gotoFixture(page);

        const opened = await page.evaluate(function() {
            var win = /** @type {any} */ (window);
            return win.baguetteBox.show(2, win.smokeGalleries.basic[0]);
        });

        expect(opened).toBe(true);
        await expect(page.locator('#baguetteBox-overlay')).toBeVisible();
        await expect(page.locator('#baguette-img-2 img')).toHaveAttribute('src', /basic-3-full/);
    });
});
