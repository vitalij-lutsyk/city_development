<template>
  <div id="app">
    <main-page />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import MainPage from '@/views/Main.vue'
export default {
  components: {
    MainPage
  },
  methods: {
    ...mapActions({
      getBuildings: 'act_getBuildings'
    })
  },
  created() {
    this.getBuildings()
  }
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
