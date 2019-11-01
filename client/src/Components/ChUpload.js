import React, { Component } from "react";
import { connect } from "react-redux";
import { addDocument } from "../actions";

import {
  Container,
  Header,
  Button,
  Icon
} from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import axios from 'axios';
import "react-toastify/dist/ReactToastify.css";

import Loader from "react-loader-spinner";

class ChUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      selectedFile: null,
      dkey: "",
      busObId: '',
      chObj: '',
      busObPublicId: '',
      AccountId: '',
    };
  }

  componentDidMount() {
    console.log("did mount upload.js"); //this.props);
    this.cherwellHello();

    this.setState({
      selectedFile: null,
      dkey: `cherwell/${this.props.location.state.chObj}`,
      busObId: this.props.location.state.busObId,
      chObj: this.props.location.state.chObj,
      busObPublicId: this.props.location.state.busObPublicId,
      AccountId: this.props.location.state.AccountId,
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log("in will receive Upload screen");
    console.log(nextProps);
    if(nextProps.docs.length > this.props.docs.length)
      this.notify();
    
    this.setState({
      selectedFile: null,
      dkey: "",
    });

    //nextProps.history.goBack();
    //setTimeout(function(){ nextProps.history.push("/") }, 3000);
  }

  onChangeHandler = event => {
    event.preventDefault();
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    });
  };

  //toastify message
  notify = () => toast.success("Upload Successfull! Going back to Cherwell");
  cherwellHello = () => toast.info("Hello Cherwell User, welcome!!");

  onClickHandler = () => {
    this.setState({
      loading: true
    });
    const data = new FormData();
    if (this.state.selectedFile !== null && (this.state.dkey !== "" || this.state.busObId !== "" || this.state.AccountId !== "" || this.state.busObPublicId !== "")) {
      console.log(this.state.dkey);
      console.log(this.state.busObPublicId);
      console.log(this.state.busObId);

      data.append("file", this.state.selectedFile);
      data.append("dkey", `cherwell|${this.state.chObj}`);
      data.append("busObId", this.state.busObId);
      data.append("AccountId", this.state.AccountId);
      data.append("busObPublicId", this.state.busObPublicId);
      data.append("cherwell", true);
      
      //console.log(data);
      // console.log(this.state.selectedFile);

    //   this.props.addDocument(data);
    axios
      .post("http://10.228.19.14:49160/api/upload", data, {
        // receive two parameter endpoint url ,form data
      })
      .then(res => {
        // then print response status
        console.log(res.statusText);
        this.notify();
        //console.log(res);
        // window.open(res.data.url, '_blank');
        // try closing current window
        
        setTimeout(function(){ window.close('','_parent',''); }, 4000);

        // return dispatch({
        //   type: ADD_DOCUMENNT,
        //   payload: res.data.data,
        //   id: res.data.id
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          loading: false
        });
        return "error";
      });
    } else {
      toast.error("Please select a file and add a topic/folder dkey");
    }

    this.setState({
      loading: false
    });
    document.getElementById("form").reset();
  };

  render() {
    return (
      <Container fluid>
        <Header as="h2">Upload a file</Header>

        {this.state.loading ? (
          <Loader type="Puff" color="#2BAD60" height={100} width={100} />
        ) : (
          <div></div>
        )}
        <div className="row" style={{ textAlign: "center" }}>
          <div className="col-md-12">
            <div style={{ borderStyle: "inset", height: 250 }}>
              <form method="post" action="#" id="form">
                <div style={{ paddingTop: 70 }}>
                  <div
                    className="form-group files" //style={{ marginTop: 99 }}
                  >
                    <label>Upload Your File </label>
                    <input
                      type="file"
                      name="file"
                      onChange={this.onChangeHandler}
                    />
                  </div>
                </div>
              </form>
            </div>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnVisibilityChange
              draggable
              pauseOnHover
            />
            <Button
              animated="vertical"
              color="blue"
              // content="Like"
              disabled={this.state.selectedFile === null}
              size="massive"
              style={{ marginTop: 20 }}
              onClick={this.onClickHandler}
            >
              <Button.Content hidden>Upload</Button.Content>
              <Button.Content visible>
                <Icon name="upload" />
              </Button.Content>
            </Button>
            {/* <Button
              color="red"
              // content="Like"
              size='massive'

              icon="upload"
              onClick={this.onClickHandler}
              label={{
                basic: true,
                color: "red",
                pointing: "left",
                content: "Upload"
              }}
              style={{ marginTop: 15 }}
            /> */}
            {/* <button
            type="button"
            class="btn btn-success btn-block"
            onClick={this.onClickHandler}
          >
            Upload
          </button> */}
          </div>
          {/* <div class="col-md-6">
                    <form method="post" action="#" id="#">
                        <div class="form-group files color">
                            <label>Upload Your File </label>
                            <input type="file" name="file" onChange={this.onChangeHandler} />
                        </div>
                    </form>
                </div> */}
        </div>
      </Container>
    );
  }
}

const mapStateToProps = ({ documents }) => {
  console.log("in map state to props upload.js");
  //console.log(documents);

  return { docs: documents };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     addDocument: doc => dispatch(addDocument(doc))
//   }
// }

export default connect(
  mapStateToProps,
  { addDocument }
)(ChUpload);
