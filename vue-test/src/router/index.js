import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import a from "../views/a.vue";
import b from "../views/b.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/a",
    name: "a",
    component: a
  },
  {
    path: "/b",
    name: "b",
    component: b
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
