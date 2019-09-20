import React, { Component } from "react";
import { connect } from 'react-redux';
import "semantic-ui-css/semantic.min.css";
import {
  Divider,
  Grid,
  Header,
  Image,
  Label,
  Table
} from "semantic-ui-react";

import image from '../static/images/square-image.png'
import axios from 'axios'
import _ from 'lodash'
import Loader from 'react-loader-spinner';

class Dashboard extends Component {
  state = {
    dropdownMenuStyle: {
      display: "none"
    },
    loading: true,
    latest: [],
    allDocs: []
  };

  //get all latest posts
  getLatestPosts = async () => {
    // this.setState({ loading: true });
    await axios
      .get("http://localhost:8000/api/getLatest")
      .then(response => {
        //console.log(response.data.data);
        this.setState({ latest: response.data.data, 
          loading: false 
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  // populate the table with latest files
  populateTable = () => {
    console.log(this.state.latest)
    // const row = new Table.Row;
    let table = [];

    this.state.latest.forEach(element => {
      let children = [];
      
      
      children.push(<Table.Cell key={1}>{element.ogName}</Table.Cell>);
      children.push(<Table.Cell key={2}>{element.latestName}</Table.Cell>);
      children.push(<Table.Cell key={3}>{element.updatedAt}</Table.Cell>);
      children.push(<Table.Cell key={4}>{element.revisions}</Table.Cell>);
      children.push(<Table.Cell key={5}>download</Table.Cell>);
      table.push(<Table.Row key={element._id} children={children} />)     
    });

    return table;
  }

  handleToggleDropdownMenu = () => {
    let newState = Object.assign({}, this.state);
    if (newState.dropdownMenuStyle.display === "none") {
      newState.dropdownMenuStyle = { display: "flex" };
    } else {
      newState.dropdownMenuStyle = { display: "none" };
    }

    this.setState(newState);
  };

  componentDidMount() {
    console.log('component mounted');
    this.getLatestPosts();
  }

  render() {
    return (
      <Grid padded>
        <Grid.Row>
          <Header dividing size="huge" as="h1">
            Dashboard
          </Header>
        </Grid.Row>
        <Grid.Row textAlign="center">
          <Grid.Column mobile={8} tablet={4} computer={4}>
            {/* <div style={{ paddingVertical: 5 }} class="ui fluid vertical"> */}
            <div style={{ marginBottom: 15 }} className="ui image">
              <i className="far fa-file-pdf fa-10x"></i>
            </div>
            <div className="item">
              <a className="ui teal circular massive label">4</a>
            </div>
            <div className="item">
              <p>Something else1</p>
            </div>
            {/* </div> */}

            {/* <i class="far fa-file-pdf fa-10x"></i>
              <a class="ui teal circular massive label">4</a>
              <Label basic size="large">
                Label
                  </Label>
              <p>Something else1</p> */}
          </Grid.Column>
          <Grid.Column mobile={8} tablet={4} computer={4}>
            <Image
              centered
              circular
              size="small"
              src={window.location.origin + "/images/square-image.png"}
            />
            <Label basic size="large">
              Label
            </Label>
            <p>Something else</p>
          </Grid.Column>
          <Grid.Column mobile={8} tablet={4} computer={4}>
            <Image
              centered
              circular
              size="small"
              src={window.location.origin + "/images/square-image.png"}
            />
            <Label basic size="large">
              Label
            </Label>
            <p>Something else</p>
          </Grid.Column>
          <Grid.Column mobile={8} tablet={4} computer={4}>
            <Image centered circular size="small" src={image} />
            <Label basic size="large">
              Label
            </Label>
            <p>Something else</p>
          </Grid.Column>
        </Grid.Row>
        <Divider section hidden />
        <Grid.Row>
          <Header dividing size="huge" as="h1">
            All Files
          </Header>
          {this.state.loading ? (
            <Loader type="Puff" color="#2BAD60" height={100} width={100} />
          ) : <div></div> }
        </Grid.Row>
        <Grid.Row>
          <Table singleLine striped selectable unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>File Name</Table.HeaderCell>
                  <Table.HeaderCell>Current Version</Table.HeaderCell>
                  <Table.HeaderCell>Updated At</Table.HeaderCell>
                  <Table.HeaderCell># Revisions</Table.HeaderCell>
                  <Table.HeaderCell>Download Latest</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.populateTable()}
              </Table.Body>
            </Table>
        </Grid.Row>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return { documents: state.documents };
};

export default connect(mapStateToProps)(Dashboard);