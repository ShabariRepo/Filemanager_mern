import { ADD_DOCUMENNT, FETCH_DOCUMENTS } from "./types";

export function addDocument(payload) {
  return { type: ADD_DOCUMENNT, payload };
}

export function fetchDocuments(payload){
  
  return {type: FETCH_DOCUMENTS, payload}
}