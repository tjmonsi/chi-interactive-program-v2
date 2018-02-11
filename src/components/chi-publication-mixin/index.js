import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
const collection = 'publication';

export const ChiPublicationMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        publication: {
          type: Object
        },
        publicationId: {
          type: String,
          observer: '_getPublication'
        }
      };
    }

    constructor () {
      super();
      this._boundSetPublication = this._setPublication.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closePublication();
    }

    async _getPublication (publicationId) {
      if (publicationId) {
        const { firebase, version } = await import('firebase-obj');
        this._closePublication();
        this._publicationRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${publicationId}`);
        this._publicationRef.on('value', this._boundSetPublication);
      }
    }

    _closePublication () {
      if (this._publicationRef) this._publicationRef.off('value', this._boundSetPublication);
    }

    _setPublication (snapshot) {
      this.set('publication', snapshot.val());
    }
  }
  return ElementMixin;
});
