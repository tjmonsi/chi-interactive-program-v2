import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
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
        }
      };
    }

    static get observers () {
      return [
        '_getSession(timeslot.sessions, timeslot.sessions.*)'
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
        const { firebase, version } = await import('firebase-obj');
        this._closeTimeslot();
        this._timeslotRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${timeslotId}`);
        this._timeslotRef.on('value', this._boundSetTimeslot);
      }
    }

    _closeTimeslot () {
      if (this._timeslotRef) this._timeslotRef.off('value', this._boundSetTimeslot);
    }

    _setTimeslot (snapshot) {
      this.set('timeslot', snapshot.val());
    }

    _getSession (sessions) {
      const array = [];
      if (sessions) Object.entries(sessions).forEach(([key, item]) => { array.splice(item.value, 0, key); });
      this.set('sessions', array);
    }
  }
  return ElementMixin;
});