import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../reducers/index";

const store = createStore(
  rootReducer,
  {},
  compose(
    //applies all the middleware used in app
    applyMiddleware(thunk)
  )
);
export default store;
