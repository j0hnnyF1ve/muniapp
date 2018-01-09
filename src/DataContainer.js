import React, { Component } from 'react';
import SfMap from './viewcomponents/SfMap.js';
import Gui from './viewcomponents/Gui.js';

class DataContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      maps: {},
      vehicles: new Map(),
      routeTags: new Map(),
      width: 0,
      height: 0,
      timeoutId: null
    };

    this.tagClickHandler = this.tagClickHandler.bind(this);
    this.selectAllHandler = this.selectAllHandler.bind(this);
    this.deselectAllHandler = this.deselectAllHandler.bind(this);
  }

  // passed down to children input checkboxes
  tagClickHandler(id, checked) {
    const routeTags = this.state.routeTags;
    const tag = routeTags.get(id);
    tag.active = checked;
    routeTags.set(id, tag);

    this.setState({ routeTags });
  }

  selectAllHandler() {
    const routeTags = this.state.routeTags;
    for(let [id, tag] of routeTags) {
      tag.active = true;
      routeTags.set(id, tag);
    }

    this.setState({ routeTags });
  }

  deselectAllHandler() {
    const routeTags = this.state.routeTags;
    for(let [id, tag] of routeTags) {
      tag.active = false;
      routeTags.set(id, tag);
    }

    this.setState({ routeTags });
  }

  componentDidMount() {
    const self = this;

    this.setState({
      width: window.innerWidth-200,
      height: (window.innerWidth-200) * 0.8
    });

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

    window.removeEventListener('resize', this.updateDimensions);
  }

  render() {
    return(
      <div className="dataContainer">
        <SfMap width={this.state.width} height={this.state.height} maps={this.state.maps} vehicles={this.state.vehicles} tags={this.state.routeTags}></SfMap>
        <Gui guiTitle="Bus Routes" tags={this.state.routeTags} tagClickAction={this.tagClickHandler} selectAllAction={this.selectAllHandler} deselectAllAction={this.deselectAllHandler}></Gui>
      </div>
    );
  }
}

export default DataContainer;
