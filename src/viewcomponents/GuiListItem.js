import React, { Component } from 'react';

class GuiListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: this.props.checked
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ checked: nextProps.checked });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.props.tagClickAction(this.props.id, value);

    this.setState({ checked: value });
  }

  render() {
    const divStyle = { backgroundColor: this.props.bgcolor };

    return (
      <li key="this.props.key">
        <input id={this.props.id} type="checkbox" checked={this.state.checked} onChange={this.handleInputChange} />
        <label htmlFor={this.props.id}><div className="color" style={divStyle}></div>{this.props.id}</label>
      </li>
    );
  }
}

export default GuiListItem;
