// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { customElements, IntersectionObserver, scrollTo } from 'global/window';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { LittleQStoreMixin } from '@littleq/state-manager';
// import 'utils/pages';
// import 'utils/fragments';
import { CHI_STATE } from './reducer';
import '@littleq/path-fetcher';
import '@littleq/query-params-fetcher';
import 'chi-full-schedule';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends GestureEventListeners(LittleQStoreMixin(ChiScheduleMixin(Element))) {
  static get is () { return 'chi-interactive-schedule'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      params: {
        type: Boolean,
        statePath: 'littleqQueryParams.params'
      },
      venues: {
        type: Array,
        statePath: 'chiState.venues'
      },
      filteredVenues: {
        type: Array,
        statePath: 'chiState.filteredVenues'
      }
    };
  }

  static get observers () {
    return [
      'closeNavigation(params.scheduleId, params.sessionId, params.publicationId)',
      '_goToTop(params.sessionId)'
    ];
  }

  connectedCallback () {
    super.connectedCallback();
    const target = this.shadowRoot.querySelector('nav.on-top');
    const fixed = this.shadowRoot.querySelector('nav.fixed');
    const options = { threshold: 0 };

    this._observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(({target: entryTarget, isIntersecting}) => {
        if (entryTarget) fixed.style.display = isIntersecting ? 'none' : 'block';
      });
    }, options);

    this._observer.observe(target);
    this._filterContainer = false;
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    if (this._observer) this._observer.disconnect();
  }

  _goToTop (sessionId) {
    if (sessionId === 'all') scrollTo(0, 0);
  }

  openNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'block';
    this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  closeNavigation () {
    this.shadowRoot.querySelectorAll('.nav-button.menu').forEach(node => (node.style.display = 'block'));
    this.shadowRoot.querySelectorAll('.nav-button.close').forEach(node => (node.style.display = 'none'));
    this.shadowRoot.querySelector('.fixed-phone').style.display = 'none';
    this.shadowRoot.querySelector('.filter-container').style.display = 'none';
    this._filterContainer = false;
  }

  filter () {
    this.closeNavigation();
    this._filterContainer = !this._filterContainer;
    this.shadowRoot.querySelector('.filter-container').style.display = this._filterContainer ? 'block' : 'none';
  }

  addFilter ({ target: el }) {
    // console.log(this.shadowRoot.querySelector('#filterForm').filter)
    setTimeout(() => {
      const { value, checked } = el;
      const filteredVenues = [ ...this.filteredVenues ];
      const index = filteredVenues.indexOf(value);
      if (checked && index < 0) filteredVenues.push(value);
      else if (!checked && index >= 0) {
        filteredVenues.splice(index, 1);
        if (filteredVenues.indexOf('all') >= 0) filteredVenues.splice(filteredVenues.indexOf('all'), 1);
      }
      this.dispatch({ type: CHI_STATE.FILTER_VENUE, filteredVenues });
    }, 10);
  }

  _checkIfFiltered (venue, filteredVenues) {
    return filteredVenues.indexOf(venue) >= 0;
  }

  getVenue (venue) {
    switch (venue) {
      case 'altchi':
        return 'alt.chi';
      case 'casestudy':
        return 'Case Study';
      case 'docconsortium':
        return 'Doctoral Consortium';
      default:
        return venue.charAt(0).toUpperCase() + venue.slice(1);
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
