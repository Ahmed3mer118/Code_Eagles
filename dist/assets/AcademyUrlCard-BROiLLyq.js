import{c as n,u as l,r as d,j as e,L as x,V as r}from"./index-DpxAyQDj.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],p=n("copy",m);/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],h=n("external-link",y);function u(t){return t?typeof window<"u"?`${window.location.origin}/academy/${t}`:`/academy/${t}`:""}function b({slug:t}){const{t:s}=l(),[i,a]=d.useState(!1),c=u(t),o=async()=>{try{await navigator.clipboard.writeText(c),a(!0),r.success(s("settings.urlCopied")),setTimeout(()=>a(!1),2e3)}catch{r.error(s("common.error"))}};return t?e.jsxs("div",{className:"ce-card p-6",children:[e.jsx("h3",{className:"font-extrabold text-[var(--ce-primary)]",children:s("settings.publicUrl")}),e.jsx("p",{className:"mt-1 text-sm text-[var(--ce-muted)]",children:s("settings.publicUrlHint")}),e.jsxs("div",{className:"mt-4 flex flex-col gap-3 sm:flex-row sm:items-center",children:[e.jsx("code",{className:"flex-1 break-all rounded-xl bg-[var(--ce-bg)] px-4 py-3 text-sm font-semibold text-[var(--ce-primary)]",children:c}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{type:"button",className:"ce-btn ce-btn-ghost text-sm",onClick:o,children:[e.jsx(p,{className:"h-4 w-4"}),s(i?"settings.copied":"settings.copyLink")]}),e.jsxs(x,{to:`/academy/${t}`,target:"_blank",rel:"noreferrer",className:"ce-btn ce-btn-accent text-sm",children:[e.jsx(h,{className:"h-4 w-4"}),s("settings.openAcademy")]})]})]})]}):null}export{b as A};
