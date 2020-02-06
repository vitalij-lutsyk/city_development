<template>
  <main class="is-relative" style="height: 100%">
    <main-map />
    <main-ranger v-if="downloaded" />
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
    computed: {
      ...mapState({
        downloaded: state => state.downloaded
      })
    }
  }
</script>

<style lang="scss">
  .preloader {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    height: 100%;
    .v-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
    }
  }
</style>
