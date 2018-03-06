import smoothscroll from 'smoothscroll-polyfill';
import Symbol from 'es6-symbol';
import 'chi-interactive-schedule';
// kick off the polyfill!
smoothscroll.polyfill();

if (!window.Symbol) window.Symbol = Symbol;
