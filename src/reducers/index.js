import { ADD_DOCUMENNT, FETCH_DOCUMENTS } from "../actions/types";

const initialState = {
  documentsId: [],
  documentsHash: {}
};
function rootReducer(state = initialState, action) {

  switch (action.type) {
    case ADD_DOCUMENNT:
      return Object.assign({}, state, {
        documents: state.documents.concat(action.payload)
      });
    case FETCH_DOCUMENTS:
        return Object.assign({}, state, {
          documents: state.documents.concat(action.payload)
        });
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