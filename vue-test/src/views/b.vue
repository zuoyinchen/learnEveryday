<template>
  <div class="about">
    <h1 @click="cl">bbb</h1>
  </div>
</template>
<script>
export default {
    created() {
        console.log('hhhhhhhh')
    },
    methods: {
        cl() {
            this.$router.back()
        }
    }
}
</script>
