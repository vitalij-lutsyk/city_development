<template>
  <div class="ranger">
    <el-slider
      id="ranger"
      v-model="filterValue"
      :min="mostOldest"
      :max="mostYoungest"
      :step="rangeStep"
      vertical
      range
      :marks="rangeLabels"
      height="500px"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  data() {
    return {
      filterValue: [0,0]
    }
  },
  computed: {
    ...mapState({
      currentFilter: state => state.currentFilter,
      buildingYears: state => state.buildingYears
    }),
    mostOldest() {
      return Math.min(...this.buildingYears)
    },
    mostYoungest() {
      return Math.max(...this.buildingYears)
    },
    rangeStep() {
      return (this.mostYoungest - this.mostOldest) / 20
    },
    rangeLabels() {
      let arr = {}
      let tempYoung = this.mostYoungest
      while (tempYoung > this.mostOldest) {
        arr[tempYoung] = { label: this.$createElement('strong', parseInt(tempYoung)) }
        tempYoung -= this.rangeStep
      }
      return arr
    }
  },
  methods: {
    ...mapActions({
      changeCurrentFilter: 'act_changeCurrentFilter'
    }),
    setInitialBuildings() {
      this.changeCurrentFilter(this.mostYoungest)
      this.filterValue = [this.mostOldest, this.mostYoungest]

    }
  },
  watch: {
    filterValue(newVal) {
      this.changeCurrentFilter(newVal)
    }
  },
  created() {
    this.setInitialBuildings()
  }
}
</script>
