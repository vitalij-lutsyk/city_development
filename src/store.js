import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    defaultStartPoint: [49.8416169, 24.0312634],
    baseUrl: 'https://www.overpass-api.de/api/interpreter',
    expectedType: 'json',
    expectedData: 'way["building"="yes"]["start_date"]',
    sec: 'way["building"="apartments"]["start_date"]',
    bbox: '',
    endParams: 'out geom',
    results: [],
    downloaded: false,
    currentFilter: [0, 0],
    buildingYears: [],
    filteredBuildings: []
  },

  getters: {},

  mutations: {
    mutate_results(state, val) {
      state.results = val
    },
    mutate_downloaded(state, val) {
      state.downloaded = val
    },
    mutate_bbox(state, val) {
      state.bbox = val
    },
    mutate_currentFilter(state, val) {
      state.currentFilter = val
    },
    mutate_buildingYears(state, val) {
      const unickDates = val
        .map(el => {
          return el.tags.start_date.length < 5 ? parseInt(el.tags.start_date) : null
        })
        .filter(el => el)
      state.buildingYears = [...new Set(unickDates)]
    },
    mutate_filteredBuildings(state) {
      state.filteredBuildings = []
      state.results.forEach(res => {
        if (state.currentFilter[1] >= +res.tags.start_date && state.currentFilter[0] <= +res.tags.start_date) {
          const filteredItem = {
            type: 'Feature',
            properties: { id: res.id, ...res.tags },
            geometry: {
              type: 'Polygon',
              coordinates: [res.geometry.map(node => Object.values(node).reverse())]
            }
          }
          state.filteredBuildings.push(filteredItem)
        }
      })
    }
  },
  actions: {
    // fetcing buildings
    act_getBuildings({ state, commit }) {
      if (!this.state.bbox) return
      axios
        .get(
          `${state.baseUrl}?data=[out:${state.expectedType}];(${state.expectedData}(${state.bbox});${state.sec}(${state.bbox}););${state.endParams};`
        )
        .then(res => {
          const filteredRes = res.data.elements.filter(el => el.type === 'way')
          commit('mutate_results', filteredRes)
          setTimeout(() => commit('mutate_downloaded', true), 100)
        })
        .then(() => commit('mutate_buildingYears', state.results))
        .catch(err => console.log(err))
    },

    // refresh boundaries & fetching buildings
    act_changeBBox({ commit, dispatch }, payload) {
      commit('mutate_bbox', payload)
      commit('mutate_downloaded', false)
      dispatch('act_getBuildings')
    },

    act_changeCurrentFilter({ commit }, payload) {
      commit('mutate_currentFilter', payload)
      commit('mutate_filteredBuildings')
    }
  }
})
