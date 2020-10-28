<template>
  <main class="is-relative" style="height: 100%">
    <div class="title">
      <span style="margin-right: 2rem">Explore it</span>
      <span style="display: inline-block;transform: rotate(90deg)">=)</span>
    </div>
    <main-map :currentFilter="filter"/>
    <main-ranger v-if="downloaded" @filterChange="handleFilterChange"/>
    <div class="preloader" v-if="!downloaded">
      <pulse-loader :loading="!downloaded"></pulse-loader>
    </div>
  </main>
</template>

<script>
import { mapState } from 'vuex'

import MainMap from '@/components/MainMap.vue'
import MainRanger from '@/components/Ranger.vue'
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
export default {
  components: {
    MainMap,
    MainRanger,
    PulseLoader
  },
  data() {
    return {
      filter: [0, 0]
    }
  },
  computed: {
    ...mapState({
      downloaded: state => state.downloaded
    })
  },
  methods: {
    handleFilterChange(value) {
      this.filter = value
    }
  }
}
</script>

<style lang="scss">
.title {
  position: absolute;
  top: 15px;
  left: 55px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 5px 10px;
}
.preloader {
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  .v-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
