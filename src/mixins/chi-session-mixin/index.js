import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
const collection = 'session';

export const ChiSessionMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        session: {
          type: Object
        },
        sessionId: {
          type: String,
          observer: '_getSession'
        },
        publications: {
          type: Array,
          value: []
        }
      };
    }

    static get observers () {
      return [
        '_getPublications(session.publications, session.publications.*)'
      ];
    }

    constructor () {
      super();
      this._boundSetSession = this._setSession.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeSession();
    }

    async _getSession (sessionId) {
      if (sessionId) {
        this._closeSession();
        this._sessionRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${sessionId}`);
        this._sessionRef.on('value', this._boundSetSession);
      }
    }

    _closeSession () {
      if (this._sessionRef) this._sessionRef.off('value', this._boundSetSession);
    }

    _setSession (snapshot) {
      this.set('session', snapshot.val());
    }

    _getPublications (publications) {
      const array = [];
      if (publications) Object.entries(publications).forEach(([key, item]) => { array.splice(item.value, 0, key); });
      this.set('publications', array);
    }
  }
  return ElementMixin;
});
