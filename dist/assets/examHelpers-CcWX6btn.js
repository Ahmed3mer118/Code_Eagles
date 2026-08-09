function c(t=0){const n=Math.max(0,Math.floor(t)),r=Math.floor(n/3600),s=Math.floor(n%3600/60),e=n%60;return r>0?`${r}:${String(s).padStart(2,"0")}:${String(e).padStart(2,"0")}`:`${String(s).padStart(2,"0")}:${String(e).padStart(2,"0")}`}function f(t,n){return t?new Date(t).toLocaleString(n):"—"}function b(t=[]){return Object.fromEntries(t.map(n=>[String(n.questionId),n.value]))}function g(t={}){return Object.entries(t).map(([n,r])=>({questionId:n,value:r===void 0?null:r}))}function l(t){return!(t==null||t===""||Array.isArray(t)&&t.length===0)}function u(t=[],n={}){return t.filter(r=>l(n[String(r._id)])).length}function y(t=[],n={}){return t.length-u(t,n)}function p(t){return t?Math.max(0,Math.floor((new Date(t).getTime()-Date.now())/1e3)):0}function h(t,n){var r,s,e;return!(t!=null&&t.hasInProgress)&&((t==null?void 0:t.attemptsRemaining)??0)<=0?n("exams.availability.max_attempts"):(r=t==null?void 0:t.availability)!=null&&r.available?n("exams.statusAvailable"):n(`exams.availability.${((s=t==null?void 0:t.availability)==null?void 0:s.reason)||"unavailable"}`,((e=t==null?void 0:t.availability)==null?void 0:e.reason)||"unavailable")}function o(t){var n,r;return t!=null&&t.hasInProgress?!0:!!((n=t==null?void 0:t.availability)!=null&&n.available&&((t==null?void 0:t.attemptsRemaining)??0)>0&&((r=t==null?void 0:t.access)==null?void 0:r.allowed)!==!1)}function v(t){var s,e,i;const n=t==null?void 0:t._id;return t!=null&&t.hasInProgress?{type:"resume",disabled:!1,labelKey:"exams.resumeExam",to:`/dashboard/student/quizzes/${n}`,accent:!0}:o(t)?{type:"start",disabled:!1,labelKey:"exams.openExam",to:`/dashboard/student/quizzes/${n}`,accent:!0}:(s=t==null?void 0:t.latestResult)!=null&&s.attemptId?{type:"viewResult",disabled:!1,labelKey:"exams.viewResult",to:`/dashboard/student/quizzes/${n}/results/${t.latestResult.attemptId}`,accent:!0,result:t.latestResult}:{type:"disabled",disabled:!0,labelKey:"exams.startExam",reason:(e=t==null?void 0:t.availability)!=null&&e.available?((t==null?void 0:t.attemptsRemaining)??0)<=0?"max_attempts":"unavailable":(i=t==null?void 0:t.availability)==null?void 0:i.reason,to:null,accent:!1}}function w(t,n){const r=(t==null?void 0:t.resultMessageKey)||(t==null?void 0:t.resultMode);return n(`exams.resultModes.${r}`,n(`quizzes.result${(t==null?void 0:t.resultMode)==="immediate"?"Immediate":"Teacher"}`,r))}const a={ar:`اقرأ كل سؤال بعناية. نظّم وقتك وراجع الأسئلة المعلّمة قبل التسليم.

يبدأ المؤقت فقط بعد الضغط على بدء الامتحان.

يتم حفظ إجاباتك تلقائيًا كل بضع ثوانٍ.

استخدم متصفح الأسئلة للانتقال بين الأسئلة وتعليمها للمراجعة.

سلّم فقط عندما تكون مستعدًا. الأسئلة غير المجاب عنها تُحسب كم skipped.`,en:`Read each question carefully. Manage your time and review flagged questions before submitting.

The timer starts only after you click Start Exam.

Your answers are automatically saved every few seconds.

Use the question navigator to move between questions and flag questions for review.

Submit only when you are ready. Unanswered questions will be counted as skipped.`};function d(t="ar"){return a[t]||a.ar}function S(t,n="ar"){var e;const r=d(n),s=(e=t==null?void 0:t.instructions)==null?void 0:e.trim();return s?`${r}

${s}`:r}export{h as a,w as b,o as c,S as d,p as e,f,v as g,c as h,l as i,b as j,g as k,y as l,u as m};
