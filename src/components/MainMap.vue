<template>
  <div id="map"></div>
</template>

<script>
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
      startPoint: state => state.startPoint,
      filteredBuildings: state => state.filteredBuildings
    })
  },
  data() {
    return {
      mapFull: null,
      geojsonLayer: null
    }
  },
  methods: {
    ...mapActions({
      changeBBox: 'act_changeBBox'
    }),
    createMap() {
      this.mapFull = L.map('map', {renderer: L.canvas()}).setView(this.startPoint, 17)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.mapFull)
      this.calculateBBox();
      this.mapFull.on('dragend', this.calculateBBox)
      this.mapFull.on('zoomend', () => {
        if (this.mapFull.getZoom() < 13) this.mapFull.removeLayer(this.geojsonLayer)
      })
    },
    calculateBBox() {
      const c = Object.values(this.mapFull.getBounds())
        .map(arr => {
          return Object.values(arr).map(val => val)
        })
        .flat()
        .join(',')
      if (this.mapFull.getZoom() >= 13) this.changeBBox(c)
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
      this.geojsonLayer = L.geoJSON(geojson, {
        style: {
          fillColor: 'green',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        }
      })
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
  }
}
</script>
