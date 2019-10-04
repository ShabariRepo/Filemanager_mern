import { FETCH_LATESTS } from "./types";
import axios from "axios";

export const fetchLatests = () => async dispatch => {
  console.log("in fetch latests action");

  axios
    .get("http://10.228.19.13:49160/api/getLatest").then(response => {
      //console.log(response.data.data);

      return dispatch({ type: FETCH_LATESTS, payload: response.data.data });
    }).catch(error => {
      console.log(error);
      return "error";
    });
};
