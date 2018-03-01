import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
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
        },
        authors: {
          type: Array,
          value: []
        }
      };
    }

    static get observers () {
      return [
        '_getAuthors(publication.authors, publication.authors.*)'
      ];
    }

    constructor () {
      super();
      this._boundSetPublication = this._setPublication.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closePublication();
    }

    _getPublication (publicationId) {
      if (publicationId) {
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
      // dispatchEvent(new CustomEvent('chi-layout-reflow'));
    }

    _getAuthors (authors) {
      const array = [];
      let min = 10000;
      if (authors) Object.entries(authors).forEach(([key, item]) => { min = min >= item.value ? item.value : min; });
      if (authors) Object.entries(authors).forEach(([key, item]) => { array.splice(item.value - min, 0, key); });
      this.set('authors', array);
    }
  }
  return ElementMixin;
});
