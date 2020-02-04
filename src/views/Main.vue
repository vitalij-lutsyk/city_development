<template>
  <main style="height: 100%; position: relative">
    <main-map />
    <main-ranger v-if="downloaded" />
  </main>
</template>

<script>
import { mapState } from 'vuex'
import MainMap from '@/components/MainMap.vue'
import MainRanger from '@/components/Ranger.vue'
export default {
  components: {
    MainMap,
    MainRanger
  },
  computed: {
    ...mapState({
      downloaded: state => state.downloaded
    })
  }
}
</script>
