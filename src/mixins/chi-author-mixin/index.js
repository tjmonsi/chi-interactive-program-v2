import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
const collection = 'author';

export const ChiAuthorMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        author: {
          type: Object
        },
        authorId: {
          type: String,
          observer: '_getAuthor'
        }
      };
    }

    constructor () {
      super();
      this._boundSetAuthor = this._setAuthor.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeAuthor();
    }

    _getAuthor (authorId) {
      if (authorId) {
        this._closeAuthor();
        this._authorRef = firebase.database().ref(`${version}/${collection}-model/${collection}/${authorId}`);
        this._authorRef.on('value', this._boundSetAuthor);
      }
    }

    _closeAuthor () {
      if (this._authorRef) this._authorRef.off('value', this._boundSetAuthor);
    }

    _setAuthor (snapshot) {
      this.set('author', snapshot.val());
    }
  }
  return ElementMixin;
});
