function l(n=0){const t=Math.max(0,Math.floor(n)),r=Math.floor(t/3600),i=Math.floor(t%3600/60),e=t%60;return r>0?`${r}:${String(i).padStart(2,"0")}:${String(e).padStart(2,"0")}`:`${String(i).padStart(2,"0")}:${String(e).padStart(2,"0")}`}function f(n,t){return n?new Date(n).toLocaleString(t):"—"}function c(n=[]){return Object.fromEntries(n.map(t=>[String(t.questionId),t.value]))}function d(n={}){return Object.entries(n).map(([t,r])=>({questionId:t,value:r===void 0?null:r}))}function a(n){return!(n==null||n===""||Array.isArray(n)&&n.length===0)}function o(n=[],t={}){return n.filter(r=>a(t[String(r._id)])).length}function g(n=[],t={}){return n.length-o(n,t)}function b(n){return n?Math.max(0,Math.floor((new Date(n).getTime()-Date.now())/1e3)):0}function y(n,t){var r,i,e;return!(n!=null&&n.hasInProgress)&&((n==null?void 0:n.attemptsRemaining)??0)<=0?t("exams.availability.max_attempts"):(r=n==null?void 0:n.availability)!=null&&r.available?t("exams.statusAvailable"):t(`exams.availability.${((i=n==null?void 0:n.availability)==null?void 0:i.reason)||"unavailable"}`,((e=n==null?void 0:n.availability)==null?void 0:e.reason)||"unavailable")}function h(n){var t,r;return n!=null&&n.hasInProgress?!0:!!((t=n==null?void 0:n.availability)!=null&&t.available&&((n==null?void 0:n.attemptsRemaining)??0)>0&&((r=n==null?void 0:n.access)==null?void 0:r.allowed)!==!1)}function w(n,t){const r=(n==null?void 0:n.resultMessageKey)||(n==null?void 0:n.resultMode);return t(`exams.resultModes.${r}`,t(`quizzes.result${(n==null?void 0:n.resultMode)==="immediate"?"Immediate":"Teacher"}`,r))}const s={ar:`اقرأ كل سؤال بعناية. نظّم وقتك وراجع الأسئلة المعلّمة قبل التسليم.

يبدأ المؤقت فقط بعد الضغط على بدء الامتحان.

يتم حفظ إجاباتك تلقائيًا كل بضع ثوانٍ.

استخدم متصفح الأسئلة للانتقال بين الأسئلة وتعليمها للمراجعة.

سلّم فقط عندما تكون مستعدًا. الأسئلة غير المجاب عنها تُحسب كم skipped.`,en:`Read each question carefully. Manage your time and review flagged questions before submitting.

The timer starts only after you click Start Exam.

Your answers are automatically saved every few seconds.

Use the question navigator to move between questions and flag questions for review.

Submit only when you are ready. Unanswered questions will be counted as skipped.`};function u(n="ar"){return s[n]||s.ar}function S(n,t="ar"){var e;const r=u(t),i=(e=n==null?void 0:n.instructions)==null?void 0:e.trim();return i?`${r}

${i}`:r}export{w as a,S as b,h as c,b as d,l as e,f,y as g,c as h,a as i,d as j,g as k,o as l};
