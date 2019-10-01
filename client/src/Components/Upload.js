import React, { Component } from "react";
import axios from "axios";
import { Container, Header, Button, Icon } from "semantic-ui-react";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null
    };
  }

  componentDidMount() {
    console.log(this.props);
  }

  onChangeHandler = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    });
  };

  onClickHandler = () => {
    const data = new FormData();
    data.append("file", this.state.selectedFile);

    console.log(data);
    console.log(this.state.selectedFile);
    axios
      .post("http://10.228.19.13:49160/api/upload", data, {
        // receive two parameter endpoint url ,form data
      })
      .then(res => {
        // then print response status
        console.log(res.statusText);
      });
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

            <Button animated="vertical"
              color="blue"
              // content="Like"
              size='massive'
              style={{ marginTop: 20 }}
              onClick={this.onClickHandler}
            >
              <Button.Content hidden>
                Upload
              </Button.Content>
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

export default Upload;