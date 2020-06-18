'use strict';

const testCtx = require('lib/command-helpers/test-context');
const {mkBrowser_} = require('../../utils');

describe('"test-context" helper', () => {
    let browser;

    beforeEach(() => {
        browser = mkBrowser_();
    });

    afterEach(() => sinon.restore());

    describe('"getTestContext" method', () => {
        it('should return test context for hook', () => {
            browser.executionContext = {
                type: 'hook',
                title: '"before each"',
                ctx: {
                    currentTest: {}
                }
            };

            const ctx = testCtx.getTestContext(browser.executionContext);

            assert.equal(ctx, browser.executionContext.ctx.currentTest);
        });

        it('should return test context for not hook', () => {
            browser.executionContext = {some: 'test'};

            const ctx = testCtx.getTestContext(browser.executionContext);

            assert.equal(ctx, browser.executionContext);
        });
    });

    describe('"resetTestContextValues" method', () => {
        it('should reset value in test context for one passed key', () => {
            browser.executionContext = {foo: 'value'};

            testCtx.resetTestContextValues(browser.executionContext, 'foo');

            assert.isUndefined(browser.executionContext.foo);
        });

        it('should reset values in test context for all passed keys', () => {
            browser.executionContext = {foo: 'value1', bar: 'value2'};

            testCtx.resetTestContextValues(browser.executionContext, ['foo', 'bar']);

            assert.isUndefined(browser.executionContext.foo);
            assert.isUndefined(browser.executionContext.bar);
        });
    });
});
