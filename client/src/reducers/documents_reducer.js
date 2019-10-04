import {
  ADD_DOCUMENNT,
  FETCH_DOCUMENT,
  DELETE_DOCUMENT,
  FETCH_ALL_DOCUMENTS
} from "../actions/types";

const initialState = {
  id: [],
  dHash: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_DOCUMENNT:
      console.log("in add document reducer");
      return {
        id: [...state.id, action.id],
        dHash: {
          ...state.dHash,
          [action.id]: action.payload
        }
      };
    case DELETE_DOCUMENT:
      console.log("in delete document reducer");
      const postDelIds = state.id.filter(item => {
        return item !== action.id;
      });

      delete state.dHash[action.id];
      return {
        id: postDelIds,
        dHash: state.dHash
      };
    case FETCH_DOCUMENT:
      state.document = action.payload;
      return state;
    // return {
    //   documentsHash: {
    //     ...state.documentsHash,
    //     payload
    //   }
    // }
    case FETCH_ALL_DOCUMENTS:
      console.log("in fetch all documets reducer");
      action.payload.forEach(element => {
        state.id.push(element._id);
        state.dHash[element._id] = element;
      });

      // console.log(state);

      return {
        id: state.id,
        dHash: state.dHash
      };
    default:
      return state;
  }
}
// export default rootReducer;
