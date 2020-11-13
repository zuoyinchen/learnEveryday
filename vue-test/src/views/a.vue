<template>
  <div class="about">
    <h1 @click="cl">aaaaa</h1>
  </div>
</template>
<script>
export default {
    created() {
        console.log('wwwwwww')
    },
    methods: {
        cl() {
            this.$router.push('/b')
        }
    }
}
</script>
