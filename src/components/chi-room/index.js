// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiRoomMixin } from 'chi-room-mixin';
import { customElements, history, dispatchEvent, CustomEvent } from 'global/window';
import '@polymer/polymer/lib/elements/dom-if';
import 'dialog-box';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiRoomMixin(Element) {
  static get is () { return 'chi-room'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      room: {
        type: String,
        notify: true
      },
      dayString: {
        type: String
      },
      venue: {
        type: String
      },
      _baseUrl: {
        type: String,
        value: window.baseURL || '/'
      },
      levelFiveMap: {
        type: Boolean,
        value: false
      },
      levelTwoMap: {
        type: Boolean,
        value: false
      },
      satMap: {
        type: Boolean,
        value: false
      },
      exhibits: {
        type: Boolean,
        value: false
      },
      exhibitTuesday: {
        type: Boolean,
        value: false
      },
      exhibitMonday: {
        type: Boolean,
        value: false
      }
    };
  }

  openMap () {
    const flag = true;
    if (flag) {
      return;
    }
    if (window.innerWidth <= 650) {
      history.pushState({}, '', `?maps=true&room=${this.room.room}`);
      dispatchEvent(new CustomEvent('location-changed'));
      return;
      // return window.open(`https://chi2018.acm.org/attending/stream/?timeslot=${this.timeslotRealId}&room=${this.session.roomName}`, '_blank');
      // return window.open(`https://${this.publication.youtubeUrl}`, '_blank');
    }

    const room = this.room.room;

    if (room) {
      if (room.indexOf('SAT') >= 0) {
        this.satMap = true;
        this.shadowRoot.querySelector('#map-box-sat').show();
      } else if (room.indexOf('220BC') >= 0 && this.venue === 'break') {
        this.levelTwoMap = true;
        this.shadowRoot.querySelector('#map-box-level-2').show();
      } else if (room.indexOf('220BC') >= 0 && this.dayString === 'Monday') {
        this.exhibitMonday = true;
        this.shadowRoot.querySelector('#map-box-exhibit-monday').show();
      } else if (room.indexOf('220BC') >= 0 && this.dayString === 'Tuesday') {
        this.exhibitTuesday = true;
        this.shadowRoot.querySelector('#map-box-exhibit-tuesday').show();
      } else if (room.indexOf('220BC') >= 0 && this.dayString === 'Wednesday') {
        this.exhibitTuesday = true;
        this.shadowRoot.querySelector('#map-box-exhibit-tuesday').show();
      } else if (room.indexOf('220BC') >= 0 && this.dayString === 'Thursday') {
        this.exhibitTuesday = true;
        this.shadowRoot.querySelector('#map-box-exhibit-tuesday').show();
      } else if (room.indexOf('220BC') >= 0) {
        this.exhibits = true;
        this.shadowRoot.querySelector('#map-box-exhibit').show();
      } else if (room === 'N/A') {
        console.log('none');
      } else if (parseInt(room[0], 10) === 5 || parseInt(room.replace('Foyer ', '')[0], 10) === 5) {
        this.levelFiveMap = true;
        this.shadowRoot.querySelector('#map-box-level-5').show();
      } else if (parseInt(room[0], 10) === 2 || parseInt(room.replace('Foyer ', '')[0], 10) === 2) {
        this.levelTwoMap = true;
        this.shadowRoot.querySelector('#map-box-level-2').show();
      } else {
        this.exhibits = true;
        this.shadowRoot.querySelector('#map-box-exhibit').show();
      }
    }
  }

  closeMap () {
    const maps = this.shadowRoot.querySelectorAll('.map-box');
    for (let i in maps) {
      if (maps[i].close) maps[i].close();
    }
    this.exhibits = false;
    this.levelTwoMap = false;
    this.levelFiveMap = false;
    this.satMap = false;
    this.exhibitMonday = false;
    this.exhibitTuesday = false;
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
