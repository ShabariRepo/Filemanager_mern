import React, { Component } from "react";
import { connect } from "react-redux";
import { addDocument } from "../actions";

import { Container, Header, Button, Icon } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null
    };
  }

  componentDidMount() {
    console.log("did mount upload.js"); //this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log("in will receive Upload screen");
    console.log(nextProps);
    this.notify();
    this.setState({
      selectedFile: null
    });
    
    //nextProps.history.goBack();
    setTimeout(function(){ nextProps.history.goBack() }, 4000);
  }

  onChangeHandler = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    });
  };

  //toastify message
  notify = () => toast("Upload Successfull!!");

  onClickHandler = () => {
    const data = new FormData();
    data.append("file", this.state.selectedFile);

    //console.log(data);
    // console.log(this.state.selectedFile);

    this.props.addDocument(data);
  };

  render() {
    return (
      <Container fluid>
        <Header as="h2">Upload a file</Header>
        <div className="row" style={{ textAlign: "center" }}>
          <div className="col-md-12">
            <div style={{ borderStyle: "inset", height: 250 }}>
              <form method="post" action="#" id="#">
                <div className="form-group files" style={{ paddingTop: 99 }}>
                  <label>Upload Your File </label>
                  <input
                    type="file"
                    name="file"
                    onChange={this.onChangeHandler}
                  />
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
