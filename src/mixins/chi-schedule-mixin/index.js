import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, conferenceId, version } from 'firebase-obj';
import { requestAnimationFrame } from 'global/window';
const collection = 'schedule';

export const ChiScheduleMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        scheduleArray: {
          type: Array,
          value: []
        },
        loading: {
          type: Boolean,
          value: true
        }
      };
    }

    constructor () {
      super();
      this._boundSetSchedule = this._setSchedule.bind(this);
    }

    connectedCallback () {
      super.connectedCallback();
      this._getSchedule();
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeSchedule();
    }

    _getSchedule () {
      this._closeSchedule();
      this.loading = true;
      this._scheduleRef = firebase
        .database()
        .ref(`${version}/${collection}-model/${collection}`)
        .equalTo(conferenceId)
        .orderByChild('conferenceId');
      this._scheduleRef.on('value', this._boundSetSchedule);
    }

    _closeSchedule () {
      if (this._scheduleRef) this._scheduleRef.off('value', this._boundSetSchedule);
    }

    _setSchedule (snapshot) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.loading = false;
          const schedule = [];
          snapshot.forEach(sched => {
            schedule.splice(sched.val().index, 0, { ...sched.val(), $key: sched.key });
          });
          this.set('scheduleArray', schedule);
        }, 200);
      });
    }
  }
  return ElementMixin;
});
