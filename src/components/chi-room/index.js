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
      }
    };
  }

  openMap () {
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
        this.shadowRoot.querySelector('#map-box-sat').show();
      } else if (parseInt(room[0], 10) === 5) {
        this.shadowRoot.querySelector('#map-box-level-5').show();
      } else if (parseInt(room[0], 10) === 2) {
        this.shadowRoot.querySelector('#map-box-level-2').show();
      } else {
        this.shadowRoot.querySelector('#map-box-exhibit').show();
      }
    }
  }

  closeMap () {
    const maps = this.shadowRoot.querySelectorAll('.map-box');
    for (let i in maps) {
      if (maps[i].close) maps[i].close();
    }
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
