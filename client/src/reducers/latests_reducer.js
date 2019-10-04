import { ADD_DOCUMENNT, DELETE_DOCUMENT, FETCH_LATESTS } from "../actions/types";

const initialState = {
  id: [],
  dHash: {}
};

export default function (state = initialState, action) {

  switch (action.type) {
    // case ADD_DOCUMENNT:
    //     console.log('in add document latest reducer');
    //     // check if there is a latest entry with ogName same as added
    //     let n = state.dHash.find(obj => {
    //         return obj.ogName === action.payload.ogName
    //       });

    //     if(typeof n === 'undefined'){

    //     } else {

    //     }

    //     return{
    //         id: [...state.id, action.id],
    //         dHash: {
    //             ...state.dHash,
    //             [action.id]: action.payload
    //         }
    //     };
    // case DELETE_DOCUMENT:
    //     console.log('in delete document reducer');
    //     const postDelIds = state.id.filter(item => {
    //         return item !== action.id
    //     });
        
    //     delete state.dHash[action.id];
    //     return {
    //         id: postDelIds,
    //         dHash: state.dHash
    //     };
    case FETCH_LATESTS:
        console.log('in fetch latest reducer');
        action.payload.forEach(element => {
            state.id.push(element._id);
            state.dHash[element._id] = element;
        });

        // console.log(state);

        return {
            id: state.id,
            dHash: state.dHash
        }
    default:
      return state;
  }
}
// export default rootReducer;