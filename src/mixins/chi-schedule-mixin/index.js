import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
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

    async _getSchedule () {
      const { firebase, conferenceId, version } = await import('firebase-obj');
      this._closeSchedule();
      this._scheduleRef = firebase
        .database()
        .ref(`${version}/${collection}Model/${collection}`)
        .equalTo(conferenceId)
        .orderByChild('conferenceId');
      this._scheduleRef.on('value', this._boundSetSchedule);
    }

    _closeSchedule () {
      if (this._scheduleRef) this._scheduleRef.off('value', this._boundSetSchedule);
    }

    _setSchedule (snapshot) {
      const schedule = [];
      snapshot.forEach(sched => {
        schedule.splice(sched.val().index, 0, { ...sched.val(), $key: sched.key });
      });
      this.set('scheduleArray', schedule);
    }
  }
  return ElementMixin;
});
