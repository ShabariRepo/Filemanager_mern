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
import Loader from 'react-loader-spinner';
import { Link } from "react-router-dom";
import { fetchLatests } from "../actions";
import _ from "lodash";

class Dashboard extends Component {
  state = {
    dropdownMenuStyle: {
      display: "none"
    },
    loading: true,
    latest: this.props.latests,
    allDocs: [],
    numUnique: 0,
    avgRevPerFile: 0,
    totalNumFiles: 0
  };

  updateLatestInfo = () => {
    console.log('in updateLatestInfo');
    // console.log(this.state)
    let numU = this.state.latest.length;
    let tots = 0;

    this.state.latest.forEach(element => {
      tots += element.revisions;
    });
    let arpf = Math.round((tots/this.state.latest.length) * 100)/100;
    let tnf = tots;

    this.setState({
      numUnique: numU,
      avgRevPerFile: typeof(arpf) == NaN ? 0 : arpf,
      totalNumFiles: tnf
    });
  }

  // populate the table with latest files
  populateTable = () => {
    // console.log(this.state.latest)
    // const row = new Table.Row;
    let table = [];

    this.state.latest.forEach(element => {
      let children = [];
      
      
      children.push(
        <Table.Cell key={1}>
          <Link
            to={{
              pathname: "/file",
              state: {
                selectedFile: element.ogName,
                latestVersion: element.latestName
              }
            }}
          >
            {element.ogName}
          </Link>
        </Table.Cell>
      );
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
    //this.getLatestPosts();
    this.props.fetchLatests();
  }

  componentWillReceiveProps(nextProps) {
    console.log('in will receive dashboard.js')
    // console.log(nextProps);
    this.setState({ latest: nextProps.latests, loading: false });
    this.updateLatestInfo();
  }

  render() {
    return (
      <Grid padded>
        <Grid.Row>
          <Header dividing size="huge" as="h1">
            Dashboard
            {this.state.loading ? (
              <Loader type="Puff" color="#2BAD60" height={100} width={100} />
            ) : (
              <div></div>
            )}
          </Header>
        </Grid.Row>
        <Grid.Row textAlign="center">
          <Grid.Column mobile={8} tablet={4} computer={4}>
            {/* <div style={{ paddingVertical: 5 }} class="ui fluid vertical"> */}
            <div>
              <div style={{ marginBottom: 15 }} className="ui image">
                <i className="far fa-file-pdf fa-10x"></i>
              </div>
              <div className="item">
                <a className="ui teal circular massive label">{this.state.totalNumFiles}</a>
              </div>
              <div className="item">
                <p>Total number of files</p>
              </div>
            </div>

            {/* <i class="far fa-file-pdf fa-10x"></i>
              <a class="ui teal circular massive label">4</a>
              <Label basic size="large">
                Label
                  </Label>
              <p>Something else1</p> */}
          </Grid.Column>
          <Grid.Column mobile={8} tablet={4} computer={4}>
            {/* <Image
              centered
              circular
              size="small"
              src={window.location.origin + "/images/square-image.png"}
            />
            <Label basic size="large">
              Label
            </Label>
            <p>Something else</p> */}
            <div>
              <div style={{ marginBottom: 15 }} className="ui image">
              <i className="fas fa-code-branch fa-10x"></i>
              </div>
              <div className="item">
                <a className="ui teal circular massive label">{this.state.avgRevPerFile}</a>
              </div>
              <div className="item">
                <p>Average Revisions Per file</p>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column mobile={8} tablet={4} computer={4}>
            {/* <Image
              centered
              circular
              size="small"
              src={window.location.origin + "/images/square-image.png"}
            />
            <Label basic size="large">
              Label
            </Label>
            <p>Something else</p> */}
            <div>
              <div style={{ marginBottom: 15 }} className="ui image">
                <i className="far fa-star fa-10x"></i>
              </div>
              <div className="item">
                <a className="ui teal circular massive label">{this.state.numUnique}</a>
              </div>
              <div className="item">
                <p>Number of unique files</p>
              </div>
            </div>
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
            All Latest Versions
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
                <Table.HeaderCell>File Name</Table.HeaderCell>
                <Table.HeaderCell>Current Version</Table.HeaderCell>
                <Table.HeaderCell>Updated At</Table.HeaderCell>
                <Table.HeaderCell># Revisions</Table.HeaderCell>
                <Table.HeaderCell>Download Latest</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>{this.populateTable()}</Table.Body>
          </Table>
        </Grid.Row>
      </Grid>
    );
  }
}

const mapStateToProps = ({ documents, latests }) => {
  console.log('in map state Dashboard.js');
  let latestArr = _.map(latests.dHash);
  let docArr = _.map(documents.dHash);
  
  // console.log(latests);
  // console.log(documents);
  return { documents: docArr, latests: latestArr };
};

export default connect(mapStateToProps, { fetchLatests })(Dashboard);