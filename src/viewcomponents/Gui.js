import React, { Component } from 'react';
import GuiListItem from './GuiListItem.js';

class Gui extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listItems: []
    };

    this.selectAllHandler = this.selectAllHandler.bind(this);
    this.unselectAllHandler = this.unselectAllHandler.bind(this);
  }

  selectAllHandler() {
    this.props.selectAllAction();
  }

  unselectAllHandler() {
    this.props.deselectAllAction();
  }

  componentWillReceiveProps(nextProps) {
    this.createListItems();
  } // end componentDidUpdate

  createListItems() {
    const listItems = Array.from(this.props.tags).map((tag) => {
      const id = tag[0];
      const color = (tag[1]) ? tag[1].color : '#ffffff';

      return <GuiListItem checked={tag[1].active} key={id.toString()} id={id} bgcolor={color} tagClickAction={this.props.tagClickAction}></GuiListItem>;
    });

    this.setState({ listItems });
  }

  render() {
    return (
      <form className="gui">
        <h1>{this.props.guiTitle}</h1>
        <button type="button" onClick={this.selectAllHandler}>Select All</button>
        <button type="button" onClick={this.unselectAllHandler}>Deselect All</button>
        <ul>{this.state.listItems}</ul>
      </form>
    );
  }
}

export default Gui;
