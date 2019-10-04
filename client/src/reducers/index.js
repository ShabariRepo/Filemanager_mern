import { combineReducers } from "redux";
import documents from './documents_reducer';
import latests from './latests_reducer';

export default combineReducers({
  documents,
  latests
});