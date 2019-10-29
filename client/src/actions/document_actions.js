import { ADD_DOCUMENNT, FETCH_DOCUMENT, DELETE_DOCUMENT, FETCH_ALL_DOCUMENTS } from "./types";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const addDocument = (payload) => async dispatch => {
    console.log('inside add document action');
    axios
      .post("http://10.228.19.14:49160/api/upload", payload, {
        // receive two parameter endpoint url ,form data
      })
      .then(res => {
        // then print response status
        console.log(res.statusText);
        //console.log(res);
        toast.success("Upload Successfull!!");
        return dispatch({ type: ADD_DOCUMENNT, payload: res.data.data, id: res.data.id });
      }).catch(err => {
        toast.error("something went wrong with the dev server");
        console.log(err);
        return ("error");
      });
}

export const deleteDocument = (filename, distinction) => async dispatch => {
    console.log('inside delete document action');
    axios.delete(
        "http://10.228.19.14:49160/api/deleteDoc",
        {headers: {
          Authorization: "authorizationToken"
        },
        data:{
          source:filename,
          dkey: distinction
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

// fetch for specific original name
export const fetchDocument = (selectedFile) => async dispatch =>{
  
  console.log("in fetch specific document action");

  axios
    .post("http://10.228.19.14:49160/api/getDoc", {
      ogName: selectedFile
    })
    .then(response => {
      console.log(response.data.data);

      return dispatch({ type: FETCH_DOCUMENT, payload: response.data.data });
    })
    .catch(error => {
      console.log(error);
      return "error";
    });
}

// fetch all documents
export const fetchAllDocuments = () => async dispatch =>{
  
  console.log("in fetch all documents action");

  axios
    .get("http://10.228.19.14:49160/api/getAllDocs")
    .then(response => {
      console.log(response.data.data);

      return dispatch({ type: FETCH_ALL_DOCUMENTS, payload: response.data.data });
    })
    .catch(error => {
      console.log(error);
      return "error";
    });
}