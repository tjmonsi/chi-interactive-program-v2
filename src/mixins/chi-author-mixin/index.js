import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
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

    async _getAuthor (authorId) {
      if (authorId) {
        const { firebase, version } = await import('firebase-obj');
        this._closeAuthor();
        this._authorRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${authorId}`);
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
