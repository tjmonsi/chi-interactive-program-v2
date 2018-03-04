import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
import { requestAnimationFrame } from 'global/window';
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
        },
        loading: {
          type: Boolean,
          reflectToAttribute: true,
          value: true
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

    _getSession (sessionId) {
      if (sessionId) {
        this._closeSession();
        this.loading = true;

        this._sessionRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${sessionId}`);
        this._sessionRef.on('value', this._boundSetSession);
      }
    }

    _closeSession () {
      if (this._sessionRef) this._sessionRef.off('value', this._boundSetSession);
    }

    _setSession (snapshot) {
      requestAnimationFrame(() => {
        setTimeout(async () => {
          this.set('session', snapshot.val());
          this.loading = false;
        }, 200);
      });
      // dispatchEvent(new CustomEvent('chi-layout-reflow'));
    }

    _getPublications (publications) {
      const array = [];
      if (publications) Object.entries(publications).forEach(([key, item]) => { array.splice(item.value, 0, key); });
      this.set('publications', array);
    }
  }
  return ElementMixin;
});
