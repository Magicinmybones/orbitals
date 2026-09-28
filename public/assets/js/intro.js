(function(){var d=document.documentElement;
if(!('animate' in d)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
d.classList.add('intro-pending');
setTimeout(function(){if(!window.__orbitalsIntro)d.classList.remove('intro-pending');},2500);})();
