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
import { mapState, mapActions } from 'vuex'
import { setTimeout } from 'timers'
export default {
  computed: {
    ...mapState({
      defaultStartPoint: state => state.defaultStartPoint,
      filteredBuildings: state => state.filteredBuildings
    }),
    isALotBuildings() {
      return this.filteredBuildings.length > 1000 && this.mapFull.getZoom() < 16
    },
    startLocation() {
      const urlParametersRegex = /(\?|\&)([^=]+)\=([^&]+)/gi
      const digitsRegex = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g
      const defaultLocation = {
        lat: this.defaultStartPoint[0],
        lng: this.defaultStartPoint[1],
        z: 17
      }
      if (!window.location.search) {
        return defaultLocation
      }
      const urlParameters = window.location.search.match(urlParametersRegex)
      const lat = urlParameters.find(param => param.includes('lat'))
      const lng = urlParameters.find(param => param.includes('lng'))
      const z = urlParameters.find(param => param.includes('z'))
      if (!lat || !lng || !z) {
        return defaultLocation
      }
      return {
        lat: +lat.match(digitsRegex)[0],
        lng: +lng.match(digitsRegex)[0],
        z: +z.match(digitsRegex)[0]
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
      changeBBox: 'act_changeBBox'
    }),
    createMap() {
      const { lat, lng, z } = this.startLocation
      this.mapFull = L.map(
        'map',
        {
          renderer: L.canvas()
        }
      ).setView([lat, lng], z)
      L.tileLayer(
        'http://www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      ).addTo(this.mapFull)
      this.updateUrlCoordinates()
      this.changeBBox(this.calculateBBoxBounds())
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
      this.changeBBox(this.calculateBBoxBounds())
    },
    updateUrlCoordinates() {
      const { lat, lng } = this.mapFull.getCenter()
      const searchString = `?lat=${lat}&lng=${lng}&z=${this.mapFull.getZoom()}`
      history.pushState({}, null, this.$route.path + searchString)
    },
    calculateBBoxBounds() {
      return Object.values(this.mapFull.getBounds())
        .map(arr => Object.values(arr).map(val => val))
        .flat()
        .join(',')
    },
    initCompositions() {
      if (this.mapFull.hasLayer(this.geojsonLayer)) {
        this.mapFull.removeLayer(this.geojsonLayer)
      }
      this.geojsonLayer = null
      const builds = this.filteredBuildings
      const geojson = {
        type: 'FeatureCollection',
        crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
        features: [...builds]
      }
      if (!this.isALotBuildings) {
        this.geojsonLayer = L.geoJSON(geojson, {
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
      } else {
        this.geojsonLayer = L.featureGroup()
        builds.forEach(build => {
          const _coord = build.geometry.coordinates[0][0].reverse()
          build.geometry.type = "Point"
          const circleStyle = getEpochWithStylesByYear(build)
          new L.circle(_coord, 2, circleStyle).addTo(this.geojsonLayer)
        })
      }
      this.geojsonLayer.addTo(this.mapFull)
    }
  },
  watch: {
    filteredBuildings(newVal) {
      this.initCompositions()
    }
  },
  mounted() {
    this.createMap()
    this.createLegend()
  }
}
</script>

<style lang="scss">
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