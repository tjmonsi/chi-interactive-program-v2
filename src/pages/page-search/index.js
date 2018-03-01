// define root dependencies
import { Element } from '@polymer/polymer/polymer-element';
import { LittleqPageMixin } from '@littleq/small-page-viewer/mixin';
import { ChiScheduleMixin } from 'chi-schedule-mixin';
import { customElements } from 'global/window';
import { conf } from 'chi-conference-config';
import algoliasearch from 'algoliasearch/lite';
import '@polymer/polymer/lib/elements/dom-repeat';
import 'chi-day-summary';

// define style and template
import style from './style.styl';
import template from './template.html';

const client = algoliasearch('3QB5G30QFN', '67be59962960c0eb7aec182885ef1b3f');
const index = client.initIndex(`chi-index-${conf}`);

class Component extends ChiScheduleMixin(LittleqPageMixin(Element)) {
  static get is () { return 'page-search'; }
  static get template () { return `<style>${style}</style>${template}`; }

  static get properties () {
    return {
      hits: {
        type: Array,
        value: []
      }
    };
  }

  async search () {
    const query = this.shadowRoot.querySelector('#search').value;
    const content = query
      ? await index.search(query, {
        hitsPerPage: 50,
        attributesToRetrieve: [
          'authors', 'conferenceId', 'searchType', 'sessionId', 'timeslots', 'publications', 'scheduleId', 'timeslotId'
        ]
      })
      : null;
    console.log(content)
    this.set('hits', content.hits);
  }
}

!customElements.get(Component.is)
  ? customElements.define(Component.is, Component)
  : console.warn(`${Component.is} is already defined`);
