import React, { Component } from "react";
import { connect } from "react-redux";
import "semantic-ui-css/semantic.min.css";
import {
  Divider,
  Grid,
  Header,
  Button,
  Icon,
  Table
} from "semantic-ui-react";

import Loader from "react-loader-spinner";
import { Link, Redirect } from "react-router-dom";
import queryString from "query-string";
import { fetchLatests, fetchAllDocuments } from "../actions";
import _ from "lodash";
import axios from "axios";

class Dashboard extends Component {
  state = {
    dropdownMenuStyle: {
      display: "none"
    },
    loading: true,
    toCherwell: false,
    busObId: '',
    chObj: '',
    busObPublicId: '',
    AccountId: '',
    srcResults: [],
    srcCount: 0,
    searchTerm: '',
    latest: this.props.latests,
    allDocs: this.props.documents,
    numUnique: 0,
    numBuckets: 0,
    avgRevPerFile: 0,
    totalNumFiles: 0
  };

  updateLatestInfo = () => {
    console.log("in updateLatestInfo");
    // console.log(this.state)
    let numU = this.state.latest.length;
    let tots = 0;

    this.state.latest.forEach(element => {
      tots += element.revisions;
    });
    let arpf = Math.round((tots / this.state.latest.length) * 100) / 100;
    let tnf = tots;

    this.setState({
      numUnique: numU,
      avgRevPerFile: typeof arpf == NaN ? 0 : arpf,
      totalNumFiles: tnf,
      numBuckets: numU
    });
  };

  download = (url, name) => {
    var link = document.createElement("a");
    link.download = name;
    link.href = url;
    link.click();
  };

  // handle change of text in search input
  handleSearch = (e) => {
    this.setState({
      searchTerm: e.target.value
    });
    console.log(this.state.searchTerm);
    console.log(e.target.value);

    if(e.target.value.length > 4){
      axios
      .post("http://10.228.19.14:49160/api/search", {
        ogName: e.target.value
      })
      .then(latest => {
        let { data } = latest;
        var tmpDataArr = [];
        _.forEach(data.data.hits.hits, result => {
          tmpDataArr.push(result._source);
        });
        console.log(tmpDataArr);

        this.setState({
          srcCount: data.data.hits.total,
          srcResults: tmpDataArr
        });
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      this.setState({
        srcCount: 0,
        srcResults: []
      });
    }
  }

  // load table data whether its a search result or base page load
  loadTableData = () => {
    console.log('inside load table data');
    if(this.state.srcResults.length > 0){
      return this.populateTable(true);
    } else {
      return this.populateTable(false);
    }
  }

  // populate the table with latest files
  populateTable = (search) => {
    // console.log(this.state.latest)
    // const row = new Table.Row;
    let table = [];
    let ds = (!search) ? this.state.latest : this.state.srcResults
    console.log(`Search results listing: ${search}`);

    ds.forEach(element => {
      let children = [];

      children.push(
        <Table.Cell key={1}>
          <Link
            to={{
              pathname: "/file",
              state: {
                selectedFile: element.ogName,
                latestVersion: element.latestName,
                dkey: element.dkey,
                opid: element.opid,
                quoteid: element.quoteid
              }
            }}
          >
            {element.ogName}
          </Link>
        </Table.Cell>
      );
      children.push(<Table.Cell key={2}>{element.dkey}</Table.Cell>);
      children.push(<Table.Cell key={2}>{element.opid}</Table.Cell>);
      children.push(<Table.Cell key={2}>{element.quoteid}</Table.Cell>);
      children.push(<Table.Cell key={2}>{element.latestName}</Table.Cell>);
      children.push(<Table.Cell key={3}>{element.updatedAt}</Table.Cell>);
      children.push(<Table.Cell key={4}>{element.revisions}</Table.Cell>);
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
                `http://10.228.19.14:3000/files/${element.latestName}`,
                element.latestName
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
      table.push(<Table.Row key={element._id} children={children} />);
    });
    
    return table;
  };

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
    console.log("component mounted");
    //this.getLatestPosts();
    var search = queryString.parse(this.props.location.search);
    // console.log(search);

    if (search.src === "cherwell") {
      this.setState({ 
        toCherwell: true,
        busObId: search.busObId,
        chObj: search.Obj,
        busObPublicId: search.busObPublicId,
        AccountId: search.AcctId,

      });
      //history.push("/cherwell");
    }
    this.props.fetchLatests();
    this.props.fetchAllDocuments();
  }

  componentWillReceiveProps(nextProps) {
    console.log("in will receive dashboard.js");
    // console.log(nextProps);
    this.setState({ latest: nextProps.latests, loading: false });
    this.updateLatestInfo();
  }

  render() {
    console.log("rendering");
    if (this.state.toCherwell) {
      return <Redirect to={{
        pathname: "/cherwell",
        state: {
          busObId: this.state.busObId,
          chObj: this.state.chObj,
          busObPublicId: this.state.busObPublicId,
          AccountId: this.state.AccountId
        }
      }} />;
    } else {
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
                  <a style={{ boxShadow: "1px 2px 1px #9E9E9E", elevation: 1 }} className="ui teal circular massive label">
                    {this.state.totalNumFiles}
                  </a>
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
                  <a style={{ boxShadow: "1px 2px 1px #9E9E9E", elevation: 1 }} className="ui teal circular massive label">
                    {this.state.avgRevPerFile}
                  </a>
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
                  <a style={{ boxShadow: "1px 2px 1px #9E9E9E", elevation: 1 }} className="ui teal circular massive label">
                    {this.state.numUnique}
                  </a>
                </div>
                <div className="item">
                  <p>Number of unique files</p>
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
                  <i className="fas fa-ring fa-10x"></i>
                </div>
                <div className="item">
                  <a style={{ boxShadow: "1px 2px 1px #9E9E9E", elevation: 1 }} className="ui teal circular massive label">
                    {this.state.numBuckets}
                  </a>
                </div>
                <div className="item">
                  <p>Number of unique buckets</p>
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
          <Divider section hidden />
          <Grid.Row
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "7px",
              // boxShadow: "1px 3px 1px #9E9E9E",
              // elevation: 1
            }}
          >
            <div class="ui container">
              <div class="ui search">
                <div
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)",
                    borderRadius: "5px",
                    padding: "10px",
                    paddingHorizontal: "15px",
                    boxShadow: "1px 6px 1px #9E9E9E",
                    elevation: 1
                  }}
                  class="ui massive fluid transparent icon input"
                >
                  <input class="prompt" type="text" style={{ color: 'rgba(0, 128, 128, 0.8)'}} onChange={(e) => this.handleSearch(e)} placeholder="Search" value={this.state.searchTerm} />
                  <i class="search icon"></i>
                </div>
              </div>
            </div>
          </Grid.Row>
          <Grid.Row>
            <Header dividing size="huge" as="h1">
              {(this.state.srcCount > 0) ? `Search Results: ${this.state.srcCount} results..`: 'All Latest Versions'}
            </Header>
            {this.state.loading ? (
              <Loader type="Puff" color="#2BAD60" height={100} width={100} />
            ) : (
              <div></div>
            )}
          </Grid.Row>
          <Grid.Row>
            <div style={{ maxHeight: 400, overflowX: "scroll" }}>
              <Table singleLine striped selectable unstackable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>File Name</Table.HeaderCell>
                    <Table.HeaderCell>Folder/Distinction</Table.HeaderCell>
                    <Table.HeaderCell>Object Id/Opportunity Id</Table.HeaderCell>
                    <Table.HeaderCell>Account Id/Quote Id</Table.HeaderCell>
                    <Table.HeaderCell>Current Version</Table.HeaderCell>
                    <Table.HeaderCell>Updated At</Table.HeaderCell>
                    <Table.HeaderCell># Revisions</Table.HeaderCell>
                    <Table.HeaderCell>Download Latest</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {/* {this.populateTable()} */}
                  {this.loadTableData()}
                </Table.Body>
              </Table>
            </div>
          </Grid.Row>
        </Grid>
      );
    }
  }
}

const mapStateToProps = ({ documents, latests }) => {
  console.log("in map state Dashboard.js");
  let latestArr = _.map(latests.dHash);
  let docArr = _.map(documents.dHash);

  return { documents: docArr, latests: latestArr };
};

export default connect(
  mapStateToProps,
  { fetchLatests, fetchAllDocuments }
)(Dashboard);
