import{c as r}from"./index-Bzw85AxP.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M16 14v2.2l1.6 1",key:"fo4ql5"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",key:"1osxxc"}],["path",{d:"M3 10h5",key:"r794hk"}],["path",{d:"M8 2v4",key:"1cmpym"}],["circle",{cx:"16",cy:"16",r:"6",key:"qoo3c4"}]],o=r("calendar-clock",c);function e(n){return n?Math.ceil((new Date(n)-Date.now())/864e5):null}function s(n,i){const a=e(n);return a===null?i("admin.noActiveSubscription"):a<0?i("admin.subscriptionExpired"):a===0?i("admin.subscriptionExpiresToday"):i("admin.subscriptionDaysLeft",{days:a})}export{o as C,s as f};
