import React, { Component } from 'react';
import GuiListItem from './GuiListItem.js';

class Gui extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listItems: []
    };
  }

  componentWillReceiveProps(nextProps) {

    if(this.props.tags) {
      window.tags = this.props.tags;

      const listItems = Array.from(this.props.tags).map((tag) => {
        const id = tag[0];
        const color = (tag[1]) ? tag[1].color : '#ffffff';

        return <GuiListItem key={id.toString()} id={id} bgcolor={color} tagClickAction={this.props.tagClickAction}></GuiListItem>;
      });

      this.setState({ listItems });
    }

  } // end componentDidUpdate

  render() {
    return (
      <form className="gui">
        <h1>{this.props.guiTitle}</h1>
        <ul>{this.state.listItems}</ul>
      </form>
    );
  }
}

export default Gui;
