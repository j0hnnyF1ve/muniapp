import React, { Component } from 'react';
//import logo from './logo.svg';
import * as d3 from 'd3';
import './App.css';

class App extends Component {

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">SF Muni App</h1>
        </header>
        <DataContainer />
      </div>
    );
  }
}

class DataContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      maps: {},
      vehicles: new Map(),
      routeTags: new Map()
    };

    this.tagClickHandler = this.tagClickHandler.bind(this);
  }

  // passed down to children input checkboxes
  tagClickHandler(id, checked) {
    const routeTags = this.state.routeTags;
    const tag = routeTags.get(id);
    tag.active = checked;
    routeTags.set(id, tag);

    this.setState({ routeTags });
  }

  componentDidMount() {
    const self = this;

    self.lastTimestamp = Date.now();
    updateVehicleLocs(0);
    addMap('sfmaps/streets.json', 'streets', '1', '#ffffff')
    addMap('sfmaps/arteries.json', 'arteries', '2', '#cccccc')
    addMap('sfmaps/freeways.json', 'freeways', '3', '#fff1b3')
    addMap('sfmaps/neighborhoods.json', 'neighborhoods', '1', '#dddddd')

    self.intervalId = window.setInterval( () => {
      updateVehicleLocs(self.lastTimestamp);
      self.lastTimestamp = Date.now();
    }, 15000);


    function updateVehicleLocs(timestamp = 0, callback) {
      let url =     'http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&t=';
      if(timestamp > 0) {
          url += timestamp;
      }

      fetch(url)
      .then( (response) => { if(response.ok) { return response.json(); } })
      .then( (json) => {
        if(!json.vehicle) {
          return console.log('updateVehicleLocs: No new information');
        }
        let vehicleLocsMap = self.state.vehicles;

        for(let vehicle of json.vehicle) {
            vehicleLocsMap.set(vehicle.id, vehicle);
        }

        updateTags(vehicleLocsMap);

        self.setState({ vehicles: vehicleLocsMap });
      })
      .then(callback);

      // Takes the list of Vehicle Locations and populates the tags map
      // Assigns a color to a tag on creation
      function updateTags(vehicles) {
        let tags = self.state.routeTags || new Map();

        for(let [key, vehicle] of vehicles) {
          // just add the vehicle if it doesn't exist
          if(tags.has(vehicle.routeTag) ) {
            let curTag = tags.get(vehicle.routeTag);

            if(curTag && curTag.vehicles && curTag.vehicles.length > 0 && !curTag.vehicles.includes(vehicle.id) ) {
              curTag.vehicles.push(vehicle.id);
              tags.set(vehicle.routeTag, curTag );
            }
          }
          // Tag doesn't exist, create a new tag
          else {
            let color = 'rgb(red, green, blue)'
                                          .replace('red', Math.floor( Math.random() * 255) )
                                          .replace('green', Math.floor( Math.random() * 255) )
                                          .replace('blue', Math.floor( Math.random() * 255) );

            tags.set(vehicle.routeTag, { id: vehicle.routeTag, color, active: true, vehicles: [vehicle.id] });
          }
        }

        self.setState({ routeTags: tags });
      } // end updateTags
    } // end updateVehicleLocs


    function addMap(url, name, lineWidth = '2', lineColor = '#ffffff', fillStyle = '#eeece6') {
      fetch(url)
      .then( (response) => { if(response.ok) { return response.json(); } } )
      .then( (data) => {
        let maps = self.state.maps;
        maps[name] = { data,lineWidth,lineColor,fillStyle };
        self.setState({
          maps: maps
        });
      });
    } // end addMap
  }

  componentWillUnmount() {
    window.clearInterval(this.intervalId);
  }

  render() {
    const width = Math.max(800, window.innerWidth-200);
    const height = Math.max(1200, window.innerHeight * 1.5);

    return(
      <div className="dataContainer">
        <SfMap width={width} height={height} maps={this.state.maps} vehicles={this.state.vehicles} tags={this.state.routeTags}></SfMap>
        <Gui guiTitle="Bus Routes" tags={this.state.routeTags} tagClickAction={this.tagClickHandler}></Gui>
      </div>
    );
  }
}

class SfMap extends Component {

  componentDidUpdate(prevProps, prevState) {
    if(this.props.maps.streets && this.props.maps.arteries && this.props.maps.freeways && this.props.maps.neighborhoods && this.props.vehicles && this.props.tags) {
      this.drawCanvas();
    }
  } // end componentDidUpdate

  drawCanvas() {
    if(!this.props.maps) { return; }

    const self = this;

    const projection = d3.geoMercator()
                        .center([-122.4194-.01, 37.7749])
                        .scale(300000)
                        .translate([this.props.width / 2, this.props.height / 2]);

    const ctx = this.canvas.getContext('2d');
    const circle = d3.geoCircle();
    const path = d3.geoPath().projection(projection).context(ctx);

    clearMap();
    drawMap(this.props.maps.neighborhoods);
    drawMap(this.props.maps.streets);
    drawMap(this.props.maps.arteries);
    drawMap(this.props.maps.freeways);
    drawVehicles(this.props.vehicles, this.props.tags);


    function clearMap() { ctx.clearRect(0,0, self.props.width, self.props.height); }

    function drawVehicles(vehicleLocs, tags) {
      if(!vehicleLocs.entries) { return console.error('drawVehicles Error: No Vehicle Locations supplied'); }

      for(let [key, vehicle] of vehicleLocs.entries() ) {
        let tag = tags.get(vehicle.routeTag);
        if( tag.active === true ) {
          drawVehicle( tag.color, [vehicle.lon, vehicle.lat] );
//          drawVehicle( '#ff0000', [vehicle.lon, vehicle.lat] );
        }
      }
    }

    function drawMap(dataset) {
      if(!dataset || !dataset.data) { return; }

      ctx.beginPath();
      path(dataset.data);
      ctx.fillStyle = dataset.fillStyle || '#eeece6';
      ctx.fill();
      ctx.lineWidth = dataset.lineWidth || '1';
      ctx.strokeStyle = dataset.lineColor || '#ffffff';
      ctx.stroke();
    }

    function drawVehicle(color, latlon) {
      ctx.beginPath();
      path( circle.center(latlon).radius(.001)() );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = '1';
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }
  }

  render() {
    return (
      <canvas className="sfmap" width={this.props.width} height={this.props.height} ref={ input => this.canvas = input }></canvas>
    );
  }
}

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

class GuiListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: true
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.props.tagClickAction(this.props.id, value);

    this.setState({
      checked: value
    });
  }

  render() {

    const divStyle = { backgroundColor: this.props.bgcolor };

    return (
      <li key="this.props.key">
        <input id="{this.props.id}" type="checkbox" checked={this.state.checked} onChange={this.handleInputChange} />
        <label htmlFor="{this.props.id}"><div className="color" style={divStyle}></div>{this.props.id}</label>
      </li>
    );
  }
}

export default App;
