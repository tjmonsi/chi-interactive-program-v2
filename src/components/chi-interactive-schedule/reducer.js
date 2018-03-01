import { reducers, store } from '@littleq/state-manager';
import { combineReducers } from 'redux';

const CHI_STATE = {
  VENUE: 'CHI_STATE_UPDATE_VENUES',
  FILTER_VENUE: 'CHI_STATE_UPDATE_FILTERED_VENUES'
};

reducers.chiState = (obj = { venues: [], filteredVenues: ['all'] }, action) => {
  switch (action.type) {
    case CHI_STATE.VENUE:
      return Object.assign({}, obj, {
        venues: action.venues,
        filteredVenues: obj.filteredVenues.indexOf('all') >= 0 ? [ ...action.venues, 'all' ] : obj.filteredVenues
      });
    case CHI_STATE.FILTER_VENUE:
      return Object.assign({}, obj, {
        filteredVenues: action.filteredVenues.indexOf('all') >= 0 ? [ ...obj.venues, 'all' ] : [ ...action.filteredVenues ]
      });
    default:
      return obj;
  }
};

store.replaceReducer(combineReducers(reducers));

export { CHI_STATE };
