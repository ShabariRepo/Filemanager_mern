import { ADD_DOCUMENNT, FETCH_DOCUMENTS } from "../actions/types";

const initialState = {
  documents: [],
  documentsHash: {}
};
function rootReducer(state = initialState, action) {

  switch (action.type) {
    case ADD_DOCUMENNT:
      return Object.assign({}, state, {
        documents: state.documents.concat(action.payload)
      });
    case FETCH_DOCUMENTS:
        state.documents = action.payload;
        return state;
      // return {
      //   documentsHash: {
      //     ...state.documentsHash,
      //     payload
      //   }
      // }

    default:
      return state;
  }
}
export default rootReducer;