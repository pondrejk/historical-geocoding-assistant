import React from 'react';
import { observer } from 'mobx-react';
import { Map, TileLayer} from 'react-leaflet';
import Button from './button';
import Base from './../base';


@observer
export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    const store = appStore;
    this.state = {
      focusZoom: store.config.focusZoom,
      focusOnRecordChange: store.config.focusOnRecordChange,
      maxGeoExtent: store.config.maxGeoExtent,
      wikiNoColumns: store.config.wikiNoColumns,
      geonameMaxResults: store.config.geonameMaxResults,
    }

    this.options = {
      geonameMaxResults: [1, 3, 5, 10, 15, 20],
      focusZoom: [8, 9, 10, 11, 12, 13, 14, 15],
      focusOnRecordChange: [1, 0],
      wikiNoColumns: [1, 2, 3, 4, 5, 10]
    }
  }

  style() {
    return {
      zIndex: 10000
    }
  }

  mapStyle() {
    return {
      width: '100%',
      height: '100%'
    }
  }

  styleLabel() {
    return {
      fontSize: 12
    }
  }

  styleSelect() {
    return {
      fontSize: 12
    }
  }

  handleSave() {
    appStore.saveSettings(this.state);
    appStore.closeSettings();
  }

  handleClose() {
    appStore.closeSettings();
  }

  handleGeoExtentChange(e) {
    if (this.refs.refMap) {
      const bounds = this.refs.refMap.leafletElement.getBounds()

      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      this.setState({
        maxGeoExtent: [[sw.lat, sw.lng], [ne.lat, ne.lng]]
      })
    }
  }

  handleChangeSelect(propName, e) {
    const newState = {};
    const value = e.target.value;
    newState[propName] = parseInt(e.target.value, 10);
    this.setState(newState);
  }

  _renderLabel (label) {
    return (
      <td key="label" className="has-text-right" style={{width: 250, paddingTop: 12}}>
        <label style={this.styleLabel()} className="label">{label}</label>
      </td>
    )
  }

  renderSelect(propName, propLabel) {
    return (
      <tr key={propName} >
        { this._renderLabel(propLabel) }
        <td className="control">
          <div style={this.styleSelect()} className="select">
            <select 
              value={this.state[propName]} 
              onChange={this.handleChangeSelect.bind(this, propName)} 
            >
              {
                this.options[propName].map( (option, oi) => {
                  return (
                    <option key={oi} value={option}>{option}</option>
                  )
                })
              }
            </select>
          </div>
        </td>
      </tr>
    )
  }

  renderColumnSelect(columnId, columnLabel) {
    return (
      <tr key={columnId} >
        { this._renderLabel(columnLabel) }
        <td className="control">
          <div style={this.styleSelect()} className="select">
            <select 
              value={appStore.columns[columnId]} 
            >
              {
                Object.keys(appStore.recordData).map((column, ci) => {
                  return (
                    <option key={ci} value={column}>{column}</option>
                  )
                })
              }
            </select>
          </div>
        </td>
      </tr>
    )
  }

  render() {
    const store = appStore;

    const extent = this.state.maxGeoExtent;
    const bounds = [
      [extent[0][0], extent[0][1]],
      [extent[1][0], extent[1][1]]
    ];

    const basemap = appStore.basemapById('OSM');
    
    return (
      <div className="modal is-active" style={this.style()}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Global Settings</p>
          </header>
          <section className="modal-card-body">
            <table className="table">
              <tbody>
                {this.renderSelect('geonameMaxResults', 'max geonames to search')}          
                {this.renderSelect('focusZoom', 'level of zoom on focus')}          
                {this.renderSelect('focusOnRecordChange', 'focus on record change? (1 = on)')}
                {this.renderSelect('wikiNoColumns', 'max columns from wikipedia')}

                {this.renderColumnSelect('name', 'name column')}
                {this.renderColumnSelect('localisation', 'localisation column')}
                {this.renderColumnSelect('x', 'x coordinate column')}
                {this.renderColumnSelect('y', 'y coordinate column')}
                
                <tr>
                  { this._renderLabel('Geo extent') }
                  <td>
                    <Map 
                      zoomControl={false} 
                      zoomSnap={0.1} 
                      ref="refMap" 
                      bounds={bounds} 
                      onViewportChanged={this.handleGeoExtentChange.bind(this)} 
                      style={{width: '100%', height: 200}}
                    >
                      <TileLayer {...basemap} />  
                    </Map>
                  </td>
                </tr>

              </tbody>
            </table>
          </section>
          <footer className="modal-card-foot">
            <div className="container has-text-right">
              <Button className="" icon="floppy-o" label="save and close"
                onClick={this.handleSave.bind(this)} />
              <Button className="" icon="times-circle" label="close without save"
                onClick={this.handleClose.bind(this)} />
            </div>
          </footer>
        </div>
      </div>
    )
  }
}