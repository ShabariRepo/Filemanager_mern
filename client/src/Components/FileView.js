import React, { Component } from "react";
import TimeAgo from 'react-timeago';
import axios from "axios";
import { 
  Grid,
  Header,
  Table,
  Container,
  Button,
  Icon
} from "semantic-ui-react";
import Loader from 'react-loader-spinner';

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
    versions: []
  };

  componentDidMount() {
    console.log(this.props.location);
    this.setState({
      selectedFile: this.props.location.state.selectedFile
    });

    this.displayAllFiles(this.props.location.state.selectedFile);
  }

  onChangeHandler = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    });
  };

  displayAllFiles = async (selectedFile) => {
    console.log('in display files');
    console.log(this.state.selectedFile);
    try {
      const res = await axios.post("http://10.228.19.13:49160/api/getDoc", {
        ogName: selectedFile
      });

      this.setState({
        versions: res.data.data,
        loading: false
      })

      console.log(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  // delete version
  deleteVersion = async versionName => {
    console.log('deleting version' + versionName);
    console.log(this.state.selectedFile);
    if(versionName === this.state.selectedFile){
      console.log('cannot delete latest version');
      return;
    }
    this.setState({
      loading: true
    });

    try{
      const res = await axios.post("http://10.228.19.13:49160/api/deleteDoc", {
        name: versionName
      })
        
      this.setState({
        loading: false
      });

      console.log(res);
    } catch (err){
      console.log(err);
    }
  }

  populateTable = () => {
    console.log(this.state.versions);

    let table = [];
      this.state.versions.forEach(element => {
        let children = [];

        children.push(
          <Table.Cell key={1}>
              {element.ogName}
          </Table.Cell>
        );
        children.push(
          <Table.Cell key={2}>
              {element.name}
          </Table.Cell>
        );
        children.push(<Table.Cell key={3}><TimeAgo date={element.createdAt} /></Table.Cell>);
        children.push(<Table.Cell key={5}>download</Table.Cell>);
        children.push(<Table.Cell key={5}>
          <Button animated="vertical"
            color="red"
            // content="Like"
            size='massive'
            style={{ marginTop: 20 }}
            onClick={() => this.deleteVersion(element.name)}
          >
            <Button.Content hidden>
              Delete
            </Button.Content>
            <Button.Content visible>
              <Icon name="trash" />
            </Button.Content>
          </Button>
        </Table.Cell>);
        table.push(<Table.Row key={element._id} children={children} />);
      });

      return table;
  }

  render() {
    return (
      <Container fluid>
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

export default File;
