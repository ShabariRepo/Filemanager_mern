import {
  ADD_DOCUMENNT,
  DELETE_DOCUMENT,
  FETCH_LATESTS
} from "../actions/types";
import _ from "lodash";

const initialState = {
  id: [],
  dHash: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_DOCUMENNT:
      console.log("in add document latest reducer");
      // check if there is a latest entry with ogName same as added
      
      var latarr = _.map(state.dHash);
      var exists = latarr.find(el => el.ogName === action.payload.ogName);

      if (exists !== undefined) {
        exists.revisions = exists.revisions + 1;

        exists.latestName = action.latest.name;
        exists.fileBsonId = action.latest._id;
        exists.versions.push(action.latest.name);

        state.dHash[action.latest._id] = {
          ...state.dHash[action.latest._id],
          ...action.latest
        };

        return {
          ...state
        };
      } else {
        console.log(action);
        return {
          id: [...state.id, action.latest._id],
          dHash: {
            ...state.dHash,
            [action.latest._id]: action.latest
          }
        };
        // latest.ogName = action.payload.ogName;
        // latest.latestName = action.payload.name;
        // latest.fileBsonId = action.payload._id;
        // latest.versions.push(action.payload.name);
        
        // latest.revisions = 1;
        // latest._id = action.latest._id
      }
    case DELETE_DOCUMENT:
      console.log("in delete document in latest reducer");

      var latarr = _.map(state.dHash);
      var exists = latarr.find(el => el.ogName === action.payload.ogName);

      if (exists !== undefined) {
        console.log("latest exists");
        if (exists.revisions < 2) {
          // so if its the only version in the latest collection
          // remove entirely
          const postDelIds = state.id.filter(item => {
            return item !== exists._id;
          });

          delete state.dHash[exists._id];
          return {
            id: postDelIds,
            dHash: state.dHash
          };
        } else {
          // return all in the revisions except deleted document id
          var latestFlag = false;
          // shouldn't be able to delete latest
          if (exists.latestName === action.payload.name) {
            console.log(`Deleting latest version, override current`);
            latestFlag = true;
          }

          exists.revisions =
            exists.revisions > 0 ? exists.revisions - 1 : exists.revisions;

          if (exists.versions.includes(action.payload.name)) {
            var idx = exists.versions.lastIndexOf(action.payload.name);
            console.log(idx);

            exists.versions.splice(idx, 1);
            if (latestFlag) {
              let prior = idx - 1;
              exists.latestName = exists.versions[prior];
              console.log(
                `Deleting latest version ${action.payload.name} and moving previous up ${exists.versions[prior]}`
              );
            }
          } else {
            console.log(
              `this file did not exist in the versions array ${action.payload.name}`
            );
            return;
          }

          state.dHash[exists._id] = {
            ...state.dHash[exists._id],
            exists
          };
          // console.log(...state);

          return {
            ...state
          };
        }
      } else {
        return state;
      }
    case FETCH_LATESTS:
      console.log("in fetch latest reducer");
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
