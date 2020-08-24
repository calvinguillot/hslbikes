<template>
  <v-app dark>   
    <v-main>
      <Bikes/>
    </v-main>
  </v-app>
</template>

<script>
import Bikes from './components/Bikes';

export default {
  name: 'App',

  components: {
    Bikes,
  },

  data: () => ({
    //
  }),
      created () {
      this.$vuetify.theme.dark = true
    },
};
</script>
