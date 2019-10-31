import React, { Component } from "react";
import TimeAgo from "react-timeago";
import axios from "axios";
import {
  Grid,
  Header,
  Table,
  Container,
  Button,
  Icon
} from "semantic-ui-react";
import Loader from "react-loader-spinner";
import _ from "lodash";
import { connect } from "react-redux";
import { deleteDocument } from "../actions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class File extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     selectedFile: null
  //   };
  // }

  state = {
    selectedFile: null,
    loading: true,
    versions: [],
    docs: this.props.docs
  };

  componentDidMount() {
    console.log("in did mount FileView.js");

    let vrs = _.filter(this.state.docs, doc => {
        return doc.ogName === this.props.location.state.selectedFile;
      });

    this.setState({
      selectedFile: this.props.location.state.selectedFile,
      latestVersion: this.props.location.state.latestVersion,
      distinction: this.props.location.state.dkey,      
      opid: this.props.location.state.opid,
      quoteid: this.props.location.state.quoteid,
      versions: vrs,
      loading: false
    });

    console.log(this.props);

    // this.displayAllFiles(this.props.location.state.selectedFile);
  }

  
  //toastify message
  notify = () => toast("Deleted File!!");

  componentWillReceiveProps(nextProps) {
    console.log("in will receive FileView.js");
    console.log(nextProps);

    let vrs = _.filter(nextProps.docs, doc => {
      return doc.ogName === this.state.selectedFile;
    });

    this.setState({
      loading: false,
      docs: nextProps.docs,
      versions: vrs
    });

    this.notify();
    // setTimeout(function(){ nextProps.history.goBack() }, 3000);
  }

  onChangeHandler = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    });
  };

  // displayAllFiles = async selectedFile => {
  //   console.log("in display files");
  //   console.log(this.state.selectedFile);
  //   // var arr = _.map(this.state.docs, doc => {
  //   //   return doc.ogName === selectedFile;
  //   // });

  //   // var sid = _.filter(this.state.docs, doc => {
  //   //   return doc.ogName === selectedFile;
  //   // });
  //   //// Remove undefines from the array
  //   // johns = _.without(johns, undefined)

  //   // console.log(arr);
  //   // console.log(sid);

  //   try {
  //     const res = await axios.post("http://10.228.19.14:49160/api/getDoc", {
  //       ogName: selectedFile
  //     });

  //     this.setState({
  //       versions: res.data.data,
  //       loading: false
  //     })

  //     console.log(res.data.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // download file
  download = (url, name) => {
    var link = document.createElement("a");
    link.download = name;
    link.href = url;
    link.click();
  };

  // delete version
  deleteVersion = versionName => {
    console.log("deleting version" + versionName);
    console.log(this.state.selectedFile);
    if (versionName === this.state.latestVersion) {
      console.log("deleting latest version");
      // return;
    }
    this.setState({
      loading: true
    });

    this.props.deleteDocument(versionName, this.state.distinction);
  };

  populateTable = () => {
    console.log(this.state.versions);

    let table = [];
    this.state.versions.forEach(element => {
      let children = [];

      children.push(<Table.Cell key={1}>{element.ogName}</Table.Cell>);
      children.push(
        <Table.Cell
          key={2}
          style={{ whiteSpace: "unset", wordWrap: "break-word" }}
        >
          {element.name}
        </Table.Cell>
      );
      children.push(
        <Table.Cell key={3}>
          <TimeAgo date={element.createdAt} />
        </Table.Cell>
      );
      children.push(
        <Table.Cell key={5}>
          <Button
            animated="vertical"
            color="blue"
            // content="Like"
            size="large"
            style={{ marginTop: 20 }}
            onClick={() =>
              this.download(
                `http://10.228.19.14:3000/files/${element.name}`,
                element.name
              )
            }
          >
            <Button.Content hidden>Download</Button.Content>
            <Button.Content visible>
              <Icon name="download" />
            </Button.Content>
          </Button>
        </Table.Cell>
      );
      children.push(
        <Table.Cell key={5}>
          <Button
            animated="vertical"
            color="red"
            // content="Like"
            size="large"
            style={{ marginTop: 20 }}
            onClick={() => this.deleteVersion(element.name)}
          >
            <Button.Content hidden>Delete</Button.Content>
            <Button.Content visible>
              <Icon name="trash" />
            </Button.Content>
          </Button>
        </Table.Cell>
      );
      table.push(<Table.Row key={element._id} children={children} />);
    });

    return table;
  };

  render() {
    return (
      <Container fluid>
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
        <Grid padded>
          <div class="ui teal raised segment">
            <a class="ui blue ribbon label">{this.state.selectedFile}</a>
            <Grid.Row>
              <Header dividing size="huge" as="h1">
                All Versions
              </Header>
              {this.state.loading ? (
                <Loader type="Puff" color="#2BAD60" height={100} width={100} />
              ) : (
                <div></div>
              )}
            </Grid.Row>
            <Grid.Row>
              <Table singleLine striped selectable unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Original Name</Table.HeaderCell>
                    <Table.HeaderCell>Version Name</Table.HeaderCell>
                    <Table.HeaderCell>Updated At</Table.HeaderCell>
                    <Table.HeaderCell>Download Version</Table.HeaderCell>
                    <Table.HeaderCell>Delete Version</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{this.populateTable()}</Table.Body>
              </Table>
            </Grid.Row>
          </div>
        </Grid>
      </Container>
    );
  }
}

const mapStateToProps = ({ documents }) => {
  console.log("in map state to props FileView.js");
  //console.log(documents);

  return { docs: _.map(documents.dHash) };
};

export default connect(
  mapStateToProps,
  { deleteDocument }
)(File);
