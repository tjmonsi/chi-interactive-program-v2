import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
import { requestAnimationFrame } from 'global/window';
const collection = 'timeslot';

export const ChiTimeslotMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        timeslot: {
          type: Object
        },
        timeslotId: {
          type: String,
          observer: '_getTimeslot'
        },
        sessions: {
          type: Array,
          value: []
        },
        loading: {
          type: Boolean,
          reflectToAttribute: true,
          value: false
        }
      };
    }

    static get observers () {
      return [
        '_getSession(timeslot.sessions, timeslot.className, timeslot.sessions.*)'
      ];
    }

    constructor () {
      super();
      this._boundSetTimeslot = this._setTimeslot.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeTimeslot();
    }

    async _getTimeslot (timeslotId) {
      if (timeslotId) {
        this._closeTimeslot();
        this._timeslotRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${timeslotId}`);
        this._timeslotRef.on('value', this._boundSetTimeslot);
      }
    }

    _closeTimeslot () {
      if (this._timeslotRef) this._timeslotRef.off('value', this._boundSetTimeslot);
    }

    _setTimeslot (snapshot) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.set('timeslot', snapshot.val());
        }, 200);
      });
    }

    _getSession (sessions, className) {
      const array = [];
      if (sessions) Object.entries(sessions).forEach(([key, item]) => { array.splice(item.value, 0, { key, room: item.room, title: item.title }); });
      array.sort((a, b) => {
        const attr = className === 'workshops' ? 'title' : 'room';
        if (a[attr] < b[attr]) return -1;
        if (a[attr] > b[attr]) return 1;
        return 0;
      });
      this.set('sessions', array);
    }
  }
  return ElementMixin;
});
