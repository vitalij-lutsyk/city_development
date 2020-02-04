<template>
  <div id="app">
    <main-page />
    <!-- <div class="ranger" v-if="showRanger">
      <el-slider
        id="ranger"
        v-model="currentFilter"
        :step="rangeStep"
        :min="mostOldest"
        :max="mostYangest"
        vertical
        :marks="years"
        height="500px">
      </el-slider>
    </div>
    <div id="map"></div> -->
  </div>
</template>

<script>
// import L from 'leaflet'
import { mapActions } from 'vuex'
// import { mapActions, mapState } from 'vuex'
// import { setTimeout } from 'timers'
// L.Icon.Default.imagePath = '.'
// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png')
// })
import MainPage from '@/views/Main.vue'
export default {
  components: {
    MainPage
  },
  // computed: {
  //   ...mapState({
  //     results: state => state.results,
  //     downloaded: state => state.downloaded
  //   }),
  //   filteredBuildings () {
  //     return this.buildings().filter(el => el)
  //   }
  // },
  // data () {
  //   return {
  //     mapFull: null,
  //     geojsonLayer: null,
  //     mostOldest: 1,
  //     mostYangest: 2020,
  //     rangeStep: 20,
  //     currentFilter: 2020,
  //     years: {},
  //     showRanger: false
  //   }
  // },
  methods: {
    ...mapActions({
      getBuildings: 'act_getBuildings'
      //     // changeBBox: 'act_changeBBox'
    })
    // createMap () {
    //   this.mapFull = L.map('map').setView([49.84, 24.03], 15)
    //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.mapFull)
    //   this.mapFull.on('dragend', () => {
    //     const c = Object.values(this.mapFull.getBounds()).map(arr => {
    //       return Object.values(arr).map(val => val)
    //     }).flat().join(',')
    //     if (this.mapFull.getZoom() >= 13) this.changeBBox(c)
    //   })
    //   this.mapFull.on('zoomend', () => {
    //     if (this.mapFull.getZoom() < 13) this.mapFull.removeLayer(this.geojsonLayer)
    //   })
    // },
    // initCompositions () {
    //   const geojson = {
    //     type: 'FeatureCollection',
    //     crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    //     features: [ ...this.filteredBuildings ]
    //   }
    //   this.geojsonLayer = L.geoJSON(geojson, {
    //     style: {
    //       fillColor: 'green',
    //       weight: 2,
    //       opacity: 1,
    //       fillOpacity: 0.7
    //     }
    //   })
    //   this.geojsonLayer.addTo(this.mapFull)
    // },
    // buildings () {
    //   return this.results.map(res => {
    //     if (this.currentFilter >= +res.tags.start_date) return {
    //       type: 'Feature',
    //       properties: { id: res.id, ...res.tags },
    //       geometry: {
    //         type: 'Polygon',
    //         coordinates: [res.geometry.map(node => Object.values(node).reverse())]
    //       }
    //     }
    //   })
    // },
    // calculateRange () {
    //   this.years = {}
    //   const ages = this.results.map(el => parseInt(el.tags.start_date) > 1256 ? parseInt(el.tags.start_date) : null).filter(el => el)
    //   const years = [...new Set(ages)]
    //   this.mostOldest = Math.min(...years)
    //   this.mostYangest = Math.max(...years)
    //   this.rangeStep = (this.mostYangest - this.mostOldest) / 20
    //   let tempYang = this.mostYangest
    //   while (tempYang > this.mostOldest) {
    //     this.years[tempYang] = { label: this.$createElement('strong', parseInt(tempYang)) }
    //     tempYang -= this.rangeStep
    //   }
    //   this.showRanger = true
    // }
  },
  // watch: {
  //   downloaded (newVal) {
  //     if (newVal) {
  //       this.currentFilter = 2020
  //       this.initCompositions()
  //       this.calculateRange()
  //     } else {
  //       this.mapFull.removeLayer(this.geojsonLayer)
  //     }
  //   },
  //   currentFilter (newVal) {
  //     setTimeout(() => {
  //       this.mapFull.removeLayer(this.geojsonLayer)
  //       this.initCompositions()
  //     }, 200)
  //   }
  // },
  created() {
    this.getBuildings()
  }
  // mounted () {
  //   this.createMap()
  // }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.ranger {
  position: absolute;
  z-index: 1000;
  right: 40px;
  top: 40px;
  background-color: rgba(255, 255, 255, 0.61);
  padding: 20px;
  padding-right: 50px;
}
#map {
  width: 100%;
  height: inherit;
}
</style>
