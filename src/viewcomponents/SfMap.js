import * as d3 from 'd3';
import React, { Component } from 'react';

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

export default SfMap;
