import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { firebase, version } from 'firebase-obj';
const collection = 'room';

export const ChiRoomMixin = dedupingMixin(base => {
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   */
  class ElementMixin extends base {
    static get properties () {
      return {
        room: {
          type: Object
        },
        roomId: {
          type: String,
          observer: '_getRoom'
        }
      };
    }

    constructor () {
      super();
      this._boundSetRoom = this._setRoom.bind(this);
    }

    disconnectedCallback () {
      super.disconnectedCallback();
      this._closeRoom();
    }

    async _getRoom (roomId) {
      if (roomId) {
        this._closeRoom();
        this._roomRef = firebase.database().ref(`${version}/${collection}Model/${collection}/${roomId}`);
        this._roomRef.on('value', this._boundSetRoom);
      }
    }

    _closeRoom () {
      if (this._roomRef) this._roomRef.off('value', this._boundSetRoom);
    }

    _setRoom (snapshot) {
      this.set('room', snapshot.val());
    }
  }
  return ElementMixin;
});
