import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_-UidwBIJ.mjs';
import { manifest } from './manifest_DYUl2Gvg.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/content.astro.mjs');
const _page3 = () => import('./pages/admin/login.astro.mjs');
const _page4 = () => import('./pages/admin/logout.astro.mjs');
const _page5 = () => import('./pages/admin/upload.astro.mjs');
const _page6 = () => import('./pages/admin.astro.mjs');
const _page7 = () => import('./pages/api/admin/content.astro.mjs');
const _page8 = () => import('./pages/api/admin/login.astro.mjs');
const _page9 = () => import('./pages/api/admin/logout.astro.mjs');
const _page10 = () => import('./pages/api/admin/upload.astro.mjs');
const _page11 = () => import('./pages/api/auth/login.astro.mjs');
const _page12 = () => import('./pages/api/auth/logout.astro.mjs');
const _page13 = () => import('./pages/api/auth/me.astro.mjs');
const _page14 = () => import('./pages/api/auth/policies.astro.mjs');
const _page15 = () => import('./pages/api/auth/register.astro.mjs');
const _page16 = () => import('./pages/api/auth/withdraw.astro.mjs');
const _page17 = () => import('./pages/api/content/library.astro.mjs');
const _page18 = () => import('./pages/api/content/purchase.astro.mjs');
const _page19 = () => import('./pages/api/content/read/_id_.astro.mjs');
const _page20 = () => import('./pages/api/payments/create.astro.mjs');
const _page21 = () => import('./pages/api/payments/verify.astro.mjs');
const _page22 = () => import('./pages/contact.astro.mjs');
const _page23 = () => import('./pages/faq.astro.mjs');
const _page24 = () => import('./pages/library.astro.mjs');
const _page25 = () => import('./pages/login.astro.mjs');
const _page26 = () => import('./pages/logout.astro.mjs');
const _page27 = () => import('./pages/member-access.astro.mjs');
const _page28 = () => import('./pages/payment/callback.astro.mjs');
const _page29 = () => import('./pages/policies.astro.mjs');
const _page30 = () => import('./pages/privacy.astro.mjs');
const _page31 = () => import('./pages/read/_id_.astro.mjs');
const _page32 = () => import('./pages/register.astro.mjs');
const _page33 = () => import('./pages/terms.astro.mjs');
const _page34 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/content.astro", _page2],
    ["src/pages/admin/login.astro", _page3],
    ["src/pages/admin/logout.astro", _page4],
    ["src/pages/admin/upload.astro", _page5],
    ["src/pages/admin/index.astro", _page6],
    ["src/pages/api/admin/content.ts", _page7],
    ["src/pages/api/admin/login.ts", _page8],
    ["src/pages/api/admin/logout.ts", _page9],
    ["src/pages/api/admin/upload.ts", _page10],
    ["src/pages/api/auth/login.ts", _page11],
    ["src/pages/api/auth/logout.ts", _page12],
    ["src/pages/api/auth/me.ts", _page13],
    ["src/pages/api/auth/policies.ts", _page14],
    ["src/pages/api/auth/register.ts", _page15],
    ["src/pages/api/auth/withdraw.ts", _page16],
    ["src/pages/api/content/library.ts", _page17],
    ["src/pages/api/content/purchase.ts", _page18],
    ["src/pages/api/content/read/[id].ts", _page19],
    ["src/pages/api/payments/create.ts", _page20],
    ["src/pages/api/payments/verify.ts", _page21],
    ["src/pages/contact.astro", _page22],
    ["src/pages/faq.astro", _page23],
    ["src/pages/library.astro", _page24],
    ["src/pages/login.astro", _page25],
    ["src/pages/logout.astro", _page26],
    ["src/pages/member-access.astro", _page27],
    ["src/pages/payment/callback.astro", _page28],
    ["src/pages/policies.astro", _page29],
    ["src/pages/privacy.astro", _page30],
    ["src/pages/read/[id].astro", _page31],
    ["src/pages/register.astro", _page32],
    ["src/pages/terms.astro", _page33],
    ["src/pages/index.astro", _page34]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///workspace/dist/client/",
    "server": "file:///workspace/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
