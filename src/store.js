import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    defaultStartPoint: [49.8416169, 24.0312634],
    baseUrl: 'https://www.overpass-api.de/api/interpreter',
    expectedType: 'json',
    expectedDataRules: [
      'relation["building"]["start_date"]',
      'way["building"]["start_date"]'
    ],
    bbox: '',
    endParams: 'out geom',
    buildings: [],
    downloaded: false,
    currentFilter: [0, 0],
    buildingYears: [],
  },

  getters: {
    filteredBuildings: state => {
      if(!state.buildings.length) return []
      return state.buildings.filter(build => {
        return state.currentFilter[1] >= +build.properties.start_date &&
        state.currentFilter[0] <= +build.properties.start_date
      }
    )}
  },

  mutations: {
    mutate_buildings(state, val) {
      state.buildings = val
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
          return el.properties.start_date.length < 5 ? parseInt(el.properties.start_date) : null
        })
        .filter(el => el)
      state.buildingYears = [...new Set(unickDates)]
    }
  },
  actions: {
    // fetcing buildings
    act_getBuildings({ state, commit }) {
      if (!this.state.bbox) return
      axios
        .get(
          `${state.baseUrl}?data=[out:${state.expectedType}];(${state.expectedDataRules.map(rule => `${rule}(${state.bbox});`).join('')});${state.endParams};`
        )
        .then(res => {
          const preparedBuildings = res.data.elements.map(build => {
            const preparedBuild = {
              type: 'Feature',
              properties: { id: build.id, ...build.tags },
              geometry: {
                type: 'Polygon'
              }
            }
            if (build.type === 'way') {
              preparedBuild.geometry.coordinates = [build.geometry.map(node => Object.values(node).reverse())]
            } else if (build.type === 'relation') {
              preparedBuild.geometry.coordinates = [build.members.find(member => member.role === 'outer').geometry.map(node => Object.values(node).reverse())]
            }
            return preparedBuild
          }).filter(build => build);
          commit('mutate_buildings', preparedBuildings)
          setTimeout(() => commit('mutate_downloaded', true), 100)
        })
        .then(() => commit('mutate_buildingYears', state.buildings))
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
    }
  }
})
