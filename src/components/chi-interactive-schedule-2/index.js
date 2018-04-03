// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { customElements, IntersectionObserver } from 'global/window';
import { store } from 'chi-store';
// import { conf } from 'chi-conference-config';
import '@littleq/path-fetcher';
import '@littleq/query-params-fetcher';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-day-2';
import 'chi-header';
import 'chi-search';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends LittleQStoreMixin(Element) {
  static get is () { return 'chi-interactive-schedule'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static properties () {
    return {
      schedule: {
        type: Array,
        value: []
      },
      searchResultTypes: {
        type: Object
      },
      showFilterWarning: {
        type: Boolean,
        value: false
      },
      searching: {
        type: Boolean,
        value: false
      },
      hitsNumber: {
        type: Number,
        value: 0
      },
      search: {
        type: String
      }
    };
  }

  constructor () {
    super();
    this._boundScheduleUpdate = this._scheduleUpdate.bind(this);
  }

  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('chi-update-schedule', this._boundScheduleUpdate);
    window.addEventListener('chi-update-query', this._boundScheduleUpdate);

    const target = this.shadowRoot.querySelector('.on-top');
    const fixed = this.shadowRoot.querySelector('.fixed');
    const options = { threshold: 0 };

    this._observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(({target: entryTarget, isIntersecting}) => {
        if (entryTarget) fixed.style.display = isIntersecting ? 'none' : 'block';
      });
    }, options);

    this._observer.observe(target);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('chi-update-schedule', this._boundScheduleUpdate);
    window.removeEventListener('chi-update-query', this._boundScheduleUpdate);
  }

  _scheduleUpdate () {
    const keys = Object.keys(store.schedule);
    const schedule = [];
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      const obj = { ...store.schedule[key], $key: key };
      schedule.push(obj);
    }
    schedule.sort((i, j) => (i.index - j.index));
    this.schedule = schedule;
    document.querySelector('#loading-screen').style.display = 'none';
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
