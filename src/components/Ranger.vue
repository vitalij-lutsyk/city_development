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
      height="400px"
      @input="handleRangerChange"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      filterValue: [0,0]
    }
  },
  computed: {
    ...mapGetters(['buildingYears']),
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
    setInitialBuildings() {
      this.filterValue = [this.mostOldest || 0, this.mostYoungest || 0]
    },
    handleRangerChange(value) {
      this.$emit('filterChange', value)
    }
  },
  created() {
    this.setInitialBuildings()
  }
}
</script>
