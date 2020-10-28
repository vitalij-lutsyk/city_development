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
    endParams: 'out geom',
    buildings: [],
    downloaded: false,
    currentFilter: [0, 0],
  },

  getters: {
    buildingYears: state => {
      const uniqueYears = state.buildings
        .map(el => {
          return el.properties.start_date.length < 5 ? parseInt(el.properties.start_date) : null
        })
        .filter(el => el)
      return [...new Set(uniqueYears)]
    }
  },

  mutations: {
    mutate_buildings(state, val) {
      state.buildings = val
    },
    mutate_downloaded(state, val) {
      state.downloaded = val
    }
  },
  actions: {
    // fetcing buildings
    act_getBuildings({ state, commit }, payload) {
      if (!payload) return
      commit('mutate_downloaded', false)
      return axios
        .get(
          `${state.baseUrl}?data=[out:${state.expectedType}];(${state.expectedDataRules.map(rule => `${rule}(${payload});`).join('')});${state.endParams};`
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
              preparedBuild.geometry.coordinates = [build.members.find(member => ['outer', 'outline'].includes(member.role)).geometry.map(node => Object.values(node).reverse())]
            }
            return preparedBuild
          }).filter(build => build);
          commit('mutate_buildings', preparedBuildings)
          setTimeout(() => commit('mutate_downloaded', true), 100)
          return true
        })
        .catch(err => console.error(err))
    }
  }
})
