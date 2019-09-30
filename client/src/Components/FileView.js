import React, { Component } from "react";
import axios from "axios";
import { 
  Grid,
  Header,
  Table,
  Container
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
      const res = await axios.post("http://localhost:49160/api/getDoc", {
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
        children.push(<Table.Cell key={3}>{element.createdAt}</Table.Cell>);
        children.push(<Table.Cell key={5}>download</Table.Cell>);
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
