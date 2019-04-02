import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
const collection = 'schedule';

export const ChiSingleScheduleMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        schedule: {
          type: Object
        },
        scheduleId: {
          type: String,
          observer: '_getSchedule'
        }
      };
    }

    constructor () {
      super();
      this._boundSetSchedule = this._setSchedule.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeSchedule();
    }

    async _getSchedule (scheduleId) {
      if (scheduleId) {
        this._closeSchedule();
        this._scheduleRef = firebase.database().ref(`${version}/${collection}-model/${collection}/${scheduleId}`);
        this._scheduleRef.on('value', this._boundSetSchedule);
      }
    }

    _closeSchedule () {
      if (this._scheduleRef) this._scheduleRef.off('value', this._boundSetSchedule);
    }

    _setSchedule (snapshot) {
      this.set('schedule', snapshot.val());
    }
  }
  return ElementMixin;
});
