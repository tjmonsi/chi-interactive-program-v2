import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
const collection = 'author';

export const ChiAuthorSummaryMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        authorName: {
          type: String
        },
        authorId: {
          type: String,
          observer: '_getAuthorName'
        }
      };
    }

    constructor () {
      super();
      this._boundSetAuthorName = this._setAuthorName.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeAuthorName();
    }

    _getAuthorName (authorId) {
      if (authorId) {
        this._closeAuthorName();
        this._authorNameRef = firebase.database().ref(`${version}/${collection}-model/${collection}/${authorId}/displayName`);
        this._authorNameRef.on('value', this._boundSetAuthorName);
      }
    }

    _closeAuthorName () {
      if (this._authorNameRef) this._authorNameRef.off('value', this._boundSetAuthorName);
    }

    _setAuthorName (snapshot) {
      this.set('authorName', snapshot.val());
    }
  }
  return ElementMixin;
});
