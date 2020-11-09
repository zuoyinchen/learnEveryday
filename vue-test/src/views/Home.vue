<template>
  <div class="home">
    <!-- <iframe src="../assets/hhh.html" frameborder="0"></iframe> -->
    <iframe src="../i.html" frameborder="0"></iframe>
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <div id="canvas"></div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import '@/assets/box2d.js'
import '@/assets/main.js'
import '@/assets/protoclass.js'
export default {
  name: "Home",
  // components: {
  //   HelloWorld
  // }
};
</script>
