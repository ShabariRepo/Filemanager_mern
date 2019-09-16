import React, { Component } from 'react'
import axios from 'axios'

class Upload extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null
        }

    }

    onChangeHandler = event => {
        this.setState({
            selectedFile: event.target.files[0],
            loaded: 0,
        })
    }

    onClickHandler = () => {
        const data = new FormData()
        data.append('file', this.state.selectedFile)

        axios.post("http://localhost:8000/upload", data, { // receive two parameter endpoint url ,form data 
        })
            .then(res => { // then print response status
                console.log(res.statusText)
            })
    }

    render() {

        return (
            <div class="row">
                <div class="col-md-12">
                    <form method="post" action="#" id="#">
                        <div class="form-group files">
                            <label>Upload Your File </label>
                            <input type="file" name="file" onChange={this.onChangeHandler} />
                        </div>
                    </form>

                    <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
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
        );
    }
}

export default Upload;