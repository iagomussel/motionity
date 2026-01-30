const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const postcss = require('postcss');

const repoRoot = path.resolve(__dirname, '../..');
const cssPath = path.join(repoRoot, 'src', 'styles.css');
const htmlPath = path.join(repoRoot, 'src', 'index.html');

function loadCssAst() {
  const css = fs.readFileSync(cssPath, 'utf8');
  return postcss.parse(css);
}

function findMediaRule(ast, matcher) {
  let found = null;
  ast.walkAtRules('media', (rule) => {
    if (matcher(rule.params)) {
      found = rule;
      return false;
    }
    return undefined;
  });
  return found;
}

function collectDecls(mediaRule, selector) {
  const decls = new Map();
  mediaRule.walkRules((rule) => {
    if (rule.selector && rule.selector.split(',').map((s) => s.trim()).includes(selector)) {
      rule.walkDecls((decl) => {
        decls.set(decl.prop, decl.value);
      });
    }
  });
  return decls;
}

test('mobile layout CSS includes responsive visibility rules', () => {
  const ast = loadCssAst();
  const mediaRule = findMediaRule(ast, (params) => params.includes('max-width: 768px'));
  assert.ok(mediaRule, 'Expected mobile @media max-width: 768px block');

  const toolbarDecls = collectDecls(mediaRule, '#toolbar');
  assert.equal(toolbarDecls.get('display'), 'none', '#toolbar hidden on mobile');

  const mobileToolbarDecls = collectDecls(mediaRule, '#mobile-toolbar');
  assert.equal(mobileToolbarDecls.get('display'), 'flex', '#mobile-toolbar shown on mobile');

  const mobileSheetDecls = collectDecls(mediaRule, '#mobile-sheet');
  assert.equal(mobileSheetDecls.get('display'), 'block', '#mobile-sheet shown on mobile');

  const modalDecls = collectDecls(mediaRule, '#download-modal');
  assert.equal(modalDecls.get('position'), 'fixed', 'Download modal uses fixed positioning on mobile');
  assert.ok(modalDecls.get('width'), 'Download modal has responsive width');
});

test('mobile layout markup is present in HTML', () => {
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes('id="mobile-toolbar"'), 'mobile toolbar exists');
  assert.ok(html.includes('id="mobile-sheet"'), 'mobile sheet exists');
  assert.ok(html.includes('id="mobile-panels"'), 'mobile panels button exists');
});
