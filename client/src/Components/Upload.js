import React, { Component } from "react";
import { connect } from "react-redux";
import { addDocument } from "../actions";

import {
  Container,
  Header,
  Button,
  Icon,
  TextArea,
  Input
} from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      dkey: "",
      opid: "",
      quoteid: ""
    };
  }

  componentDidMount() {
    console.log("did mount upload.js"); //this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log("in will receive Upload screen");
    console.log(nextProps);
    // if(nextProps.docs.length > this.props.docs.length)
    //   this.notify();
    
    this.setState({
      selectedFile: null,
      dkey: ""
    });

    //nextProps.hisdtory.goBack();
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
  notify = () => toast.success("Upload Successfull!!");

  onClickHandler = () => {
    const data = new FormData();
    if (this.state.selectedFile !== null && (this.state.dkey !== "" || this.state.opid !== "" || this.state.quoteid !== "")) {
      console.log(this.state.dkey);
      console.log(this.state.opid);
      console.log(this.state.quoteid);

      data.append("file", this.state.selectedFile);
      data.append("dkey", this.state.dkey);
      data.append("opid", this.state.opid);
      data.append("quoteid", this.state.quoteid);

      //console.log(data);
      // console.log(this.state.selectedFile);

      this.props.addDocument(data);
    } else {
      toast.error("Please select a file and add a topic/folder dkey");
    }

    document.getElementById("form").reset();
  };

  render() {
    return (
      <Container fluid>
        <Header as="h2">Upload a file</Header>
        <div className="row" style={{ textAlign: "center" }}>
          <div className="col-md-12">
            <div style={{ borderStyle: "inset", height: 250 }}>
              <form method="post" action="#" id="form">
                <div style={{ paddingTop: 70 }}>
                  <div
                    className="form-group" //style={{ paddingTop: 50 }}
                  >
                    <Input
                      icon={{ name: "folder", circular: true, link: true }}
                      placeholder="label..."
                      onChange={(e, { value }) => {
                        this.setState({
                          dkey: value
                        });
                      }}
                    />
                  </div>
                  <div
                    className="form-group" //style={{ paddingTop: 50 }}
                  >
                    <Input
                      icon={{ name: "folder", circular: true, link: true }}
                      placeholder="opportunity id..."
                      onChange={(e, { value }) => {
                        this.setState({
                          opid: value
                        });
                      }}
                    />
                  </div>
                  <div
                    className="form-group" //style={{ paddingTop: 50 }}
                  >
                    <Input
                      icon={{ name: "folder", circular: true, link: true }}
                      placeholder="quote id..."
                      onChange={(e, { value }) => {
                        this.setState({
                          quoteid: value
                        });
                      }}
                    />
                  </div>
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
)(Upload);
