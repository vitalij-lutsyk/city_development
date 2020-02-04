<template>
  <div class="ranger">
    <el-slider
      id="ranger"
      :value="currentFilter"
      :min="mostOldest"
      :max="mostYoungest"
      :step="rangeStep"
      vertical
      :marks="rangeLabels"
      height="500px"
      @change="changeCurrentFilter"
    >
    </el-slider>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  export default {
    computed: {
      ...mapState({
        currentFilter: state => state.currentFilter,
        buildingYears: state => state.buildingYears
      }),
      mostOldest() {
        return Math.min(...this.buildingYears) > 1256 ? Math.min(...this.buildingYears) : 1256
      },
      mostYoungest() {
        const max = Math.max(...this.buildingYears)
        this.changeCurrentFilter(max)
        return max
      },
      rangeStep() {
        return (this.mostYoungest - this.mostOldest) / 20
      },
      rangeLabels() {
        let arr = {}
        let tempYoung = this.mostYoungest
        while (tempYoung > this.mostOldest && tempYoung > 1256) {
          arr[tempYoung] = { label: this.$createElement('strong', parseInt(tempYoung)) }
          tempYoung -= this.rangeStep
        }
        return arr
      }
    },
    methods: {
      ...mapActions({
        changeCurrentFilter: 'act_changeCurrentFilter'
      })
    }
    // data () {
    //   return {
    //     years: {}
    //   }
    // }
  }
</script>
