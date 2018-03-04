import { Element } from '@polymer/polymer/polymer-element';
import { LittleQStoreMixin } from '@littleq/state-manager';
import { customElements, requestAnimationFrame } from 'global/window';
import css from './style.styl';
import template from './template.html';
import marked from 'marked';
import '@polymer/polymer/lib/elements/dom-if';

class Component extends LittleQStoreMixin(Element) {
  static get is () { return 'marked-element'; }

  static get properties () {
    return {
      marked: {
        type: String
      },
      queryResults: {
        type: Array,
        statePath: 'chiState.queryResults'
      }
    };
  }

  static get template () {
    return `
      <style>
        ${css}
      </style>
      ${template}
    `;
  }

  static get observers () {
    return [
      '_checkMarked(marked, queryResults)'
    ];
  }

  _checkMarked (string, queryResults) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        let newString = string || '';
        const search = [];
        if (queryResults) {
          queryResults.forEach(hit => {
            Object.entries(hit._highlightResult).forEach(([key, value]) => {
              if (value.matchedWords && value.matchedWords.length) {
                value.value.split('<em>').forEach(node => {
                  const term = node.split('</em>')[0];
                  if (node.indexOf('</em>') >= 0 && term && search.findIndex(item => item[1] === term.toLowerCase()) < 0) search.push([term, term.toLowerCase()]);
                });
              } else {
                Object.entries(value).forEach(([subkey, subvalue]) => {
                  if (subvalue.matchedWords && subvalue.matchedWords.length) {
                    subvalue.value.split('<em>').forEach(node => {
                      const term = node.split('</em>')[0];
                      if (node.indexOf('</em>') >= 0 && term && search.findIndex(item => item[1] === term.toLowerCase()) < 0) search.push([term, term.toLowerCase()]);
                    });
                  }
                });
              }
            });
          });
        }
        search.forEach(([term]) => {
          while (newString.toLowerCase().indexOf(term.toLowerCase()) >= 0) {
            let index = newString.toLowerCase().indexOf(term.toLowerCase());
            newString = newString.slice(0, index) + '<mark>$1</mark>' + newString.slice(index + term.length);
          }
          newString = newString.replace(/<mark>\$1<\/mark>/g, `<mark>${term}</mark>`);
        });
        newString = newString.replace(/`/g, '\'');
        if (newString) this.innerHTML = marked(newString).replace(/<p>/g, '').replace(/<\/p>/g, '');
      }, 100);
    });
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
