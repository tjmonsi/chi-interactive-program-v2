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
        },
        loading: {
          type: Boolean,
          value: true
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
        this.loading = true;
        this._closePublication();
        this._publicationRef = firebase.database().ref(`${version}/${collection}-model/${collection}/${publicationId}`);
        this._publicationRef.on('value', this._boundSetPublication);
      }
    }

    _closePublication () {
      if (this._publicationRef) this._publicationRef.off('value', this._boundSetPublication);
    }

    _setPublication (snapshot) {
      this.set('publication', snapshot.val());
      this.loading = false;
      // dispatchEvent(new CustomEvent('chi-layout-reflow'));
    }

    _getAuthors (authors) {
      if (authors) {
        const array = [];
        const keys = Object.keys(authors);
        for (let i = 0, l = keys.length; i < l; i++) {
          array.push({
            $key: keys[i],
            value: authors[keys[i]].value
          });
        }
        array.sort((i, j) => i.value - j.value);
        this.set('authors', array);
      }
    }
  }
  return ElementMixin;
});
