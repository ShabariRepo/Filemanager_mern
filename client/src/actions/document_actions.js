import { ADD_DOCUMENNT, FETCH_DOCUMENT, DELETE_DOCUMENT } from "./types";
import axios from "axios";

export const addDocument = (payload) => async dispatch => {
    console.log('inside add document action');
    axios
      .post("http://10.228.19.13:49160/api/upload", payload, {
        // receive two parameter endpoint url ,form data
      })
      .then(res => {
        // then print response status
        console.log(res.statusText);
        //console.log(res);
        
        return dispatch({ type: ADD_DOCUMENNT, payload: res.data.data, id: res.data.id });
      }).catch(err => {
          
        console.log(err);
        return ("error");
      });
}

export const deleteDocument = (filename) => async dispatch => {
    console.log('inside delete document action');
    axios.delete(
        "http://10.228.19.13:49160/api/deleteDoc",
        {headers: {
          Authorization: "authorizationToken"
        },
        data:{
          source:filename
        }}
      )
      .then( res => {
          console.log(res.statusText);
          // console.log(res.data);
          return dispatch({ type: DELETE_DOCUMENT, payload: res.data.data, id: res.data.data._id });
      })
      .catch (err => {
        console.log(err);
        return ("error");
    });        
}

export const fetchDocuments = (payload) => async dispatch =>{
  
  return dispatch({type: FETCH_DOCUMENT, payload});
}