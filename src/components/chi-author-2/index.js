// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { ChiAuthorMixin } from 'chi-author-mixin';
import { customElements } from 'global/window';
import '@polymer/polymer/lib/elements/dom-if';
import 'marked-element';

// define style and template
import style from './style.styl';
import template from './template.html';

class Component extends ChiAuthorMixin(Element) {
  static get is () { return 'chi-author'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      publicationId: String
    };
  }

  getNameAndInstitution (displayName, primarySet, secondarySet, publicationId) {
    const array = [`**${displayName}**`];
    const primaryArray = [];
    const secondaryArray = [];
    const institutions = [];
    if (publicationId && this.author) {
      const primary = (primarySet && primarySet[publicationId]) || this.author.primary;
      const secondary = (secondarySet && secondarySet[publicationId]) || this.author.secondary;
      if (primary.institution) {
        primaryArray.push(primary.institution);
      } else if (primary.dept) {
        primaryArray.push(primary.dept);
      }
      if (secondary.institution) {
        secondaryArray.push(secondary.institution);
      } else if (secondary.dept) {
        secondaryArray.push(secondary.dept);
      }
      const primaryString = primaryArray.length ? primaryArray.join(', ') : '';
      const secondaryString = secondaryArray.length ? secondaryArray.join(', ') : '';
      if (primaryString) {
        institutions.push(primaryString);
      }
      if (secondaryString) {
        institutions.push(secondaryString);
      }
      const institutionString = institutions.length ? institutions.join('; ') : '';
      if (institutionString) {
        array.push(institutionString);
      }
      return array.length ? array.join(', ') : '';
    }

  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
