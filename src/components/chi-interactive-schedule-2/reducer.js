import { reducers, store } from '@littleq/state-manager';
import { combineReducers } from 'redux';

const CHI_STATE = {
  VENUE: 'CHI_STATE_UPDATE_VENUES',
  FILTER_VENUE: 'CHI_STATE_UPDATE_FILTERED_VENUES',
  FILTER_SEARCH: 'CHI_STATE_UPDATE_FILTERED_SEARCH',
  QUERY_RESULTS: 'CHI_STATE_UPDATE_QUERY_RESULTS',
  SEARCH_RESULT_TYPES: 'CHI_STATE_SEARCH_RESULT_TYPES'
};

export const defaultFilteredSearch = [
  'people', 'institution', 'session', 'paper-title', 'abstract'
];

reducers.chiState = (obj = { venues: [], filteredVenues: ['all'], filteredSearch: [ ...defaultFilteredSearch, 'all' ], searchResultTypes: {} }, action) => {
  switch (action.type) {
    case CHI_STATE.SEARCH_RESULT_TYPES:
      return Object.assign({}, obj, {
        searchResultTypes: action.searchResultTypes
      });
    case CHI_STATE.VENUE:
      return Object.assign({}, obj, {
        venues: action.venues,
        filteredVenues: obj.filteredVenues.indexOf('all') >= 0 ? [ ...action.venues, 'all' ] : obj.filteredVenues
      });
    case CHI_STATE.FILTER_VENUE:
      return Object.assign({}, obj, {
        filteredVenues: action.filteredVenues.indexOf('all') >= 0 ? [ ...obj.venues, 'all' ] : action.filteredVenues
      });
    case CHI_STATE.FILTER_SEARCH:
      return Object.assign({}, obj, {
        filteredSearch: action.filteredSearch.indexOf('all') >= 0 ? [ ...defaultFilteredSearch, 'all' ] : action.filteredSearch
      });
    case CHI_STATE.QUERY_RESULTS:
      return Object.assign({}, obj, {
        queryResults: action.queryResults
      });
    default:
      return obj;
  }
};

store.replaceReducer(combineReducers(reducers));

export { CHI_STATE };
