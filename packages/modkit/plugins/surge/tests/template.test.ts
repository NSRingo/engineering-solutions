import { testParams } from '@test/modkit/common-test-config';
import { SurgeTemplate } from '../src/template';

describe('SurgeTemplate', () => {
  const surgeTemplate = new SurgeTemplate(testParams);

  it('metadata', () => {
    expect(surgeTemplate.Metadata).toContain('#!desc = This is a source config\\nand this is a new line');
    expect(surgeTemplate.Metadata).toContain('#!category = modkit');
  });

  it('script', () => {
    expect(surgeTemplate.Script).toContain(
      'script1 = script-path=./test.js, type=http-response, pattern=^http://www.example.com/test, max-size=16384, argument=boolean={{{boolean}}}&string={{{string}}}&number={{{number}}}&array={{{array}}}',
    );
    expect(surgeTemplate.Script).toContain('script2 = script-path=./fired.js, type=cron, cronexp=* * * * *');
  });

  it('rule', () => {
    expect(surgeTemplate.Rule).toContain('DOMAIN,www.apple.com,Proxy');
    expect(surgeTemplate.Rule).toContain('RULE-SET, foo, REJECT // it is comment');
  });

  it('host', () => {
    expect(surgeTemplate.Host).toContain('abc.com = 1.2.3.4');
  });

  it('url rewrite', () => {
    expect(surgeTemplate.URLRewrite).toContain('^http://www.google.cn http://www.google.com header');
    expect(surgeTemplate.URLRewrite).toContain('^http://ad.com/ad.png _ reject');
  });

  it('header rewrite', () => {
    expect(surgeTemplate.HeaderRewrite).toContain('http-request ^http://example.com header-add DNT 1');
  });

  it('body rewrite', () => {
    expect(surgeTemplate.BodyRewrite).toContain(
      'http-response ^https?://example.com/ regex1 replacement1 regex2 replacement2',
    );
  });

  it('mock', () => {
    expect(surgeTemplate.MapLocal).toContain('^http://surgetest.com/json data-type=text data="{}" status-code=500');
    expect(surgeTemplate.MapLocal).toContain(
      '^http://surgetest.com/file data-type=file data="foo" header="a:b|foo:bar"',
    );
  });

  it('mitm', () => {
    expect(surgeTemplate.MITM).toContain('hostname = %APPEND% example.com');
  });
});
