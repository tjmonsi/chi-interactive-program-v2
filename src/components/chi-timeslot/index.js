// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { ChiTimeslotMixin } from 'chi-timeslot-mixin';
import { customElements, requestAnimationFrame, CustomEvent, history, dispatchEvent } from 'global/window';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { checkVisible } from 'chi-interactive-schedule/check-visible';
import { debounce } from 'chi-interactive-schedule/debounce';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import 'chi-session';

// define style and template
import style from './style.styl';
import template from './template.html';

let loaded = false;

class Component extends GestureEventListeners(LittleQStoreMixin(ChiTimeslotMixin(Element))) {
  static get is () { return 'chi-timeslot'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      scheduleIndex: {
        type: Number
      },
      dateString: {
        type: String
      },
      dayString: {
        type: String
      },
      filteredVenues: {
        type: Array,
        statePath: 'chiState.filteredVenues'
      },
      showSessions: {
        type: Boolean,
        value: false,
        observer: '_showAndFocusSession'
      },
      params: {
        type: Object,
        value: {},
        statePath: 'littleqQueryParams.params'
      }
    };
  }

  static get observers () {
    return [
      '_showSessions(params.timeslotId, params.oldTimeslotId, timeslotId, params.search, timeslot, params.*)',
      '_checkTimeslot(timeslot, sessions, filteredVenues)'
    ];
  }

  constructor () {
    super();
    this._debouncedCheckTimeslot = debounce(this._checkTimeslotOnce.bind(this), 500);
    this._debouncedShowSessionOnce = debounce(this._showSessionOnce.bind(this), 500);
  }

  _checkTimeslotOnce () {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.timeslot) {
          this.hidden = !this.timeslot.sessions || (this.timeslot.sessions && Object.entries(this.timeslot.sessions).length === this.shadowRoot.querySelectorAll('chi-session[hidden]').length);
          this.dispatchEvent(new CustomEvent('chi-timeslot-hidden'));
        }
      }, 150);
    });
  }

  _showSessions (paramsTimeslotId, paramsOldTimeslotId, timeslotId, search) {
    loaded
      ? this._showSessionOnce(paramsTimeslotId, paramsOldTimeslotId, timeslotId, search)
      : this._debouncedShowSessionOnce(paramsTimeslotId, paramsOldTimeslotId, timeslotId, search);
  }

  _showSessionOnce (paramsTimeslotId, paramsOldTimeslotId, timeslotId, search) {
    this.showSessions = !!((this._isEqual(paramsTimeslotId, timeslotId) || (this.timeslot && this.timeslot.sessions[this.params.sessionId]) || search));
  }

  _showAndFocusSession (showSessions) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        // if (this._focusPublications) scroll(0, (scrollY + this.shadowRoot.querySelector('h3').getBoundingClientRect().top) - 102);
        if (showSessions && !this.params.sessionId && !this.params.publicationId && !this.params.search) {
          // scroll(0, (scrollY + this._clone.shadowRoot.querySelector(`.invi-anchor-session-${sessionId}`).getBoundingClientRect().top) - 102);
          this.shadowRoot.querySelector('.sessions').render();
          const el = this.shadowRoot.querySelector(`.invi-anchor-timeslot-${this.timeslotId}`);

          el.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
          loaded = true;
          // console.log(checkVisible(el))
          if (!checkVisible(el)) {
            setTimeout(() => {
              this._showAndFocusSession(showSessions);
            }, 200);
          }
        }
      }, 200);
    });
  }

  _isEqual (a, b) { return a === b; }

  _checkTimeslot () {
    this._debouncedCheckTimeslot();
  }

  _timeslotColorClass (index) {
    switch (index) {
      case 0:
        return 'blue';
      case 1:
        return 'grey';
      case 2:
        return 'green';
      case 3:
        return 'yellow';
      case 4:
        return 'orange';
      case 5:
        return 'pink';
      default:
        return 'pink';
    }
  }

  _toggleTimeslot () {
    history.pushState({}, '', `?${this.showSessions ? 'oldTimeslotId' : 'timeslotId'}=${this.timeslotId}&${this.params.search && this.params.search.trim() ? `search=${this.params.search}` : ''}`);
    dispatchEvent(new CustomEvent('location-changed'));
  }

  _toggleSession (event) {
    const { target: el, path } = event;
    let comingFromPath = false;
    const { sessionId, showPublications, forceClose } = el;
    for (let indexElement in path) {
      let element = path[indexElement];
      if (element.nodeName === 'A' && element.href.indexOf(sessionId) >= 0) {
        comingFromPath = true;
        break;
      }
    }
    if ((forceClose || !showPublications) && !comingFromPath) {
      history.pushState({}, '', `?${showPublications || forceClose ? 'oldSessionId' : 'sessionId'}=${sessionId}&${this.params.search && this.params.search.trim() ? `search=${this.params.search}` : ''}`);
      dispatchEvent(new CustomEvent('location-changed'));
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
