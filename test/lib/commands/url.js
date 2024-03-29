'use strict';

const _ = require('lodash');
const wrapUrlCommand = require('lib/commands/url');
const {PAGE_LOAD_TIMEOUT} = require('lib/constants');
const {mkBrowser_} = require('../../utils');

describe('"url" command', () => {
    let browser, initialDocument;

    const wrapUrlCommand_ = (browser, config = {}) => {
        config = _.defaultsDeep(config, {
            pageLoadTimeout: null
        });

        wrapUrlCommand(browser, {config});
    };

    beforeEach(() => {
        browser = mkBrowser_();
        initialDocument = global.document;
        global.document = {body: {remove: sinon.stub()}};
    });

    afterEach(() => {
        sinon.restore();
        global.document = initialDocument;
    });

    it('should wrap "url" command', () => {
        wrapUrlCommand_(browser);

        assert.calledOnceWith(browser.overwriteCommand, 'url', sinon.match.func);
    });

    it('should call base "url" command if url is not passed', async () => {
        const baseUrlFn = browser.url;
        wrapUrlCommand_(browser);

        await browser.url();

        assert.calledOnce(baseUrlFn);
        assert.notCalled(browser.execute);
    });

    it('should remove body element from the page before make request', async () => {
        const baseUrlFn = browser.url;
        wrapUrlCommand_(browser);

        browser.execute.callsFake(() => {
            browser.execute.firstCall.args[0]();
        });

        await browser.url('/?text=test');

        assert.calledOnceWith(browser.execute, sinon.match.func);
        assert.calledOnce(global.document.body.remove);
        assert.callOrder(browser.execute, baseUrlFn);
    });

    it('should not reject if body element does not exist on the page', async () => {
        wrapUrlCommand_(browser);

        global.document.body = null;
        browser.execute.callsFake(() => {
            browser.execute.firstCall.args[0]();
        });

        await assert.isFulfilled(browser.url('/?text=test'));
    });

    it('should wait until request will be completed', async () => {
        const elem = await browser.$();

        wrapUrlCommand_(browser, {pageLoadTimeout: 100500});

        browser.waitUntil.callsFake(() => {
            browser.waitUntil.firstCall.args[0]();
        });

        await browser.url('/?text=test');

        assert.calledOnceWith(
            browser.waitUntil,
            sinon.match.func,
            100500,
            'The page did not load in 100500 ms'
        );
        assert.calledOnceWith(elem.isDisplayed);
    });

    it('should use default "pageLoadTimeout" if it does not specified in browser config', async () => {
        wrapUrlCommand_(browser, {pageLoadTimeout: null});

        await browser.url('/?text=test');

        assert.calledOnceWith(
            browser.waitUntil,
            sinon.match.func,
            PAGE_LOAD_TIMEOUT,
            `The page did not load in ${PAGE_LOAD_TIMEOUT} ms`
        );
    });
});
