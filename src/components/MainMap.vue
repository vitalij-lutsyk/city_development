<template>
  <div id="map"></div>
</template>

<script>
import { getEpochWithStylesByYear, epochByFirstYear } from '../data/epoches'
import L from 'leaflet'
L.Icon.Default.imagePath = '.'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})
import { mapState, mapGetters, mapActions } from 'vuex'
import { setTimeout } from 'timers'
export default {
  props: {
    currentFilter: Array
  },
  computed: {
    ...mapState({
      defaultStartPoint: state => state.defaultStartPoint,
      downloaded: state => state.downloaded,
      buildings: state => state.buildings
    }),
    filteredBuildings() {
      if(!this.buildings.length) return []
      return this.buildings
        .filter(build =>
          this.currentFilter[1] >= +build.properties.start_date &&
          this.currentFilter[0] <= +build.properties.start_date
        )
    },
    startLocation() {
      const urlParametersRegex = /(\?|\&)([^=]+)\=([^&]+)/gi
      const digitsRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
      const defaultLocation = {
        lat: this.defaultStartPoint[0],
        lng: this.defaultStartPoint[1],
        zoom: 17
      }
      if (!window.location.search) {
        return defaultLocation
      }
      const urlParameters = window.location.search.match(urlParametersRegex)
      const lat = urlParameters.find(param => param.includes('lat'))
      const lng = urlParameters.find(param => param.includes('lng'))
      const zoom = urlParameters.find(param => param.includes('zoom'))
      if (!lat || !lng || !zoom) {
        return defaultLocation
      }
      return {
        lat: +lat.match(digitsRegex)[0],
        lng: +lng.match(digitsRegex)[0],
        zoom: +zoom.match(digitsRegex)[0]
      }
    }
  },
  data() {
    return {
      mapFull: null,
      geojsonLayer: null,
    }
  },
  methods: {
    ...mapActions({
      getBuildings: 'act_getBuildings'
    }),
    createMap() {
      const { lat, lng, zoom } = this.startLocation
      this.mapFull = L.map(
        'map',
        {
          renderer: L.canvas()
        }
      ).setView([lat, lng], zoom)
      L.tileLayer(
        'http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      ).addTo(this.mapFull)
      this.updateUrlCoordinates()
      this.mapFull.on('dragend', this.handleMapMove)
      this.mapFull.on('zoomend', this.handleMapZoom)
    },
    createLegend() {
      const legend = L.control({position: 'bottomright'})
      legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend')
        const content = Object.values(epochByFirstYear)
          .map(item => `<div class="legend-item">`+
                        `<div class="item-value" style="background-color:${item.color}">${item.from}-${item.to}</div>`+
                        `<div class="item-name">${item.name}</div>`+
                      `</div>`
          )
          .join('')
        const contentWrapper = `<div class="legeng-content">${content}</div>`
        div.innerHTML = contentWrapper
        return div
      }
      legend.addTo(this.mapFull)
    },
    handleMapZoom() {
      this.updateUrlCoordinates()
      if (this.mapFull.getZoom() < 13) this.mapFull.removeLayer(this.geojsonLayer)
    },
    handleMapMove() {
      this.updateUrlCoordinates()
      if (this.mapFull.getZoom() <= 13) return
      this.getBuildings(this.getMapBoundaries())
        .then(() => this.setBuildsAsGeoJsonLayer())
    },
    updateUrlCoordinates() {
      const { lat, lng } = this.mapFull.getCenter()
      const searchString = `?lat=${lat}&lng=${lng}&zoom=${this.mapFull.getZoom()}`
      history.pushState({}, null, this.$route.path + searchString)
    },
    getMapBoundaries() {
      return Object.values(this.mapFull.getBounds())
        .map(arr => Object.values(arr).map(val => val))
        .flat()
        .join(',')
    },
    createPolygonsLayer() {
      const geojson = {
        type: 'FeatureCollection',
        crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
        features: [...this.filteredBuildings]
      }
      const layer = L.geoJSON(geojson, {
        style: getEpochWithStylesByYear
      })
        .bindPopup((layer) => {
          const {
            ['addr:housenumber']: housenumber,
            ['addr:street']: street,
            name,
            start_date,
            wikipedia
          } = layer.feature.properties
          return `<div>
              ${name ? (`<p>${name}</p>`) : ''}
              <p>${street}, ${housenumber}</p>
              ${
                wikipedia ?
                (`<p><a href="https://wikipedia.org/wiki/${wikipedia}" target="_blank">Wiki</a></p>`) :
                ''
              }
            </div>`
        })
        .bindTooltip(layer => layer.feature.properties.start_date)
      return layer
    },
    setBuildsAsGeoJsonLayer() {
      if (this.mapFull.hasLayer(this.geojsonLayer)) {
        this.mapFull.removeLayer(this.geojsonLayer)
      }
      this.geojsonLayer = this.createPolygonsLayer()
      this.geojsonLayer.addTo(this.mapFull)
    }
  },
  watch: {
    currentFilter(newVal) {
      this.setBuildsAsGeoJsonLayer()
    }
  },
  mounted() {
    this.createMap()
    this.createLegend()
    this.getBuildings(this.getMapBoundaries())
      .then(() => this.setBuildsAsGeoJsonLayer())
  }
}
</script>

<style lang="scss">
.leaflet-tile.leaflet-tile-loaded {
  opacity: 0.3 !important;
}
.legend {
  background-color: rgba(255, 255, 255, 0.6);
  padding: 5px;
  font-weight: 600;
  .legend-item {
    display: flex;
    .item-value {
      padding: 2px 5px;
      margin-right: 5px;
      color: #fff;
    }
    .item-name {}
  }
}
</style>