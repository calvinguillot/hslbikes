<template>
  <v-container fluid class="pa-0 ma-0">
    <v-layout row wrap justify-center align-center style="height: 100vh; overflow: hidden;">
      <gmap-map ref="googleMap" :center="center" :zoom="12" class="gmap" :options="mapStyle">
        <gmap-marker
          :key="index"
          v-for="(mar, index) in markers"
          :position="mar.pos"
          @click="markerInfo(mar)"
          :icon="mar.style"
        >></gmap-marker>
        <gmap-info-window
          @closeclick="dialog=false"
          :opened="dialog"
          :position="center"
          :options="markerOptions"
        >
          <div style="width: 200px;text-align:center; color:white;">
            <h2>{{markerName}}</h2>
            <br />
            <div>
              Departures:
              <strong>{{markerDeparts}}</strong>
            </div>
            <div>
              Arrivals:
              <strong>{{markerReturns}}</strong>
            </div>
          </div>
        </gmap-info-window>
      </gmap-map>
      <v-layout class="selector">
        <v-layout row wrap align-left>
          <v-flex xs6 md2>
            <v-select  :items="months" label="Month" v-model="selectedMonth" solo></v-select>
          </v-flex>
          <v-flex xs4 md2 class="px-2">
            <v-btn small fab class="black" @click="monthSelector()">
              <v-icon color="white">mdi-check</v-icon>
            </v-btn>     
          </v-flex>
        </v-layout>
      </v-layout>
      <v-layout row wrap align-center justify-center class="legend">
        <div>
          <img style="width: 100%;height: 100%;object-fit: contain;" src="./Data/legend.png" />
        </div>
      </v-layout>
      <v-layout style="position:absolute; bottom:20px; right:10px;z-index:3">
        <v-flex>
          <v-btn
            fab
            small
            class="black white--text"
            @click="dialogInfo= true"
            style="font-size:150%;"
          >?</v-btn>
        </v-flex>
      </v-layout>
    </v-layout>
    <v-dialog v-model="dialogInfo" width="500">
      <v-card >
        <v-card-title class="headline" primary-title>HSL Bike Stations</v-card-title>
        <v-divider></v-divider>
        <v-card-text >
          This map showcases the usage of Helsinki Regional Transport's bike network stations, over the 2019 season (April-October).
          <br />
          <br />Each circle represents the location of the station, the size of the circle represents the amount of events per station, and the colour represents the ratio between departures and arrivals from and to said station.
          <br />
          <br />Feel free to change the month and see how the usage changes over time. By clicking on a station, you can see more detailed information.
          <br />
          <br />The datasets for this project can be found
          <a
            href="https://www.avoindata.fi/data/en_GB/dataset/helsingin-ja-espoon-kaupunkipyorilla-ajatut-matkat"
          >here</a>.
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import * as geoClass from "geostats";
import mapNight from "./Data/mapNight_2.json";
import m4 from "./Data/data_04.json";
import m5 from "./Data/data_05.json";
import m6 from "./Data/data_06.json";
import m7 from "./Data/data_07.json";
import m8 from "./Data/data_08.json";
import m9 from "./Data/data_09.json";
import m10 from "./Data/data_10.json";

export default {
   name: 'Bikes',
  data() {
    return {
      months: [
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October"
      ],
      dataset: [m4, m5, m6, m7, m8, m9, m10],
      selectedMonth: "April",
      dialog: false,
      dialogInfo: false,
      icon: null,
      percentages: [],
      percentBreaks: [],
      totals: [],
      totalsBreaks: [],
      center: { lat: 60.17, lng: 24.937 },
      mapStyle: {
        disableDefaultUI: true,
        styles: mapNight,
        scrollwheel: true,
        draggable: true,
        scaleControl: true,
      },
      markers: [],
      markerName: null,
      markerDeparts: null,
      markerReturns: null,
      markerOptions: { pixelOffset: { width: 0, height: 0 } }
    };
  },
  methods: {
    populator(m) {
      this.jenks(m);
      for (let i = 0; i < m.length; i++) {
        let marker = {
          name: m[i].name,
          pos: { lat: m[i].lat, lng: m[i].lng },
          total: m[i].total,
          origin: m[i].origin,
          origP: m[i].originPercent,
          destination: m[i].destination,
          destP: m[i].destinationPercent,
          style: {
            path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
            fillColor: this.markerColour(m[i].originPercent),
            fillOpacity: 0.5,
            strokeWeight: 0,
            scale: this.markerSize(m[i].total)
          }
        };
        this.markers.push(marker);
      }
    },
    markerInfo(m) {
      this.center = m.pos;
      this.markerName = m.name;
      this.markerDeparts = m.origin;
      this.markerReturns = m.destination;
      this.dialog = true;
    },
    markerColour(a) {
      if (a <= this.percentBreaks[1]) {
        return "#F9E721";
      } else if (a > this.percentBreaks[1] && a <= this.percentBreaks[2]) {
        return "#5AC865";
      } else if (a > this.percentBreaks[2] && a <= this.percentBreaks[3]) {
        return "#21908D";
      } else if (a > this.percentBreaks[3] && a <= this.percentBreaks[4]) {
        return "#3B1C8C";
      } else if (a > this.percentBreaks[4]) {
        return "#450256";
      } else {
        return "#00000000";
      }
    },
    markerSize(a) {
      if (a <= this.totalsBreaks[1]) {
        return 0.25;
      } else if (a > this.totalsBreaks[1] && a <= this.totalsBreaks[2]) {
        return 0.5;
      } else if (a > this.totalsBreaks[2] && a <= this.totalsBreaks[3]) {
        return 0.75;
      } else if (a > this.totalsBreaks[3] && a <= this.totalsBreaks[4]) {
        return 1;
      } else if (a > this.totalsBreaks[4]) {
        return 1.25;
      } else {
        return 0;
      }
    },
    jenks(m) {
      for (let i = 0; i < m.length; i++) {
        let a = m[i].originPercent;
        if (a !== 0) {
          this.percentages.push(a);
        }
        let b = m[i].total;
        if (b !== 0) {
          this.totals.push(b);
        }
      }

      let serieP = new geoClass(this.percentages);
      serieP.setPrecision(3);
      this.percentBreaks = serieP.getClassJenks(5);

      let serieT = new geoClass(this.totals);
      serieT.setPrecision(3);
      this.totalsBreaks = serieT.getClassJenks(5);
    },
    monthSelector() {
      this.markers = [];
      this.percentages = [];
      this.percentBreaks = [];
      this.totals = [];
      this.totalsBreaks = [];
      let x = this.months.findIndex(e => e === this.selectedMonth);
      this.populator(this.dataset[x]);
    }
  },
  mounted() {
    this.selectedMonth = this.months[0];
    this.monthSelector();
  }
};
</script>

<style>
::-webkit-scrollbar {
  display: none;
}

.gmap {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 0;
}

.gm-style .gm-style-iw-c {
  padding-top: 12px !important;
  padding-right: 12px !important;
  padding-bottom: 12px !important;
  padding-left: 12px !important;
  border-radius: 12px;
  color: white;
  background-color: black;
  box-shadow: 0px 10px 20px 2px #00000099;
}
.gm-style-iw-t::after {
  background: black !important;
  box-shadow: 0px 10px 20px 2px #00000099 !important;
  border: none;
}
.gm-ui-hover-effect {
  top: 0px !important;
  right: 0px !important;

  filter: invert();
}

.selector {
  z-index: 2;
  position: absolute;
  width: 100%;
  top: 15px;
  left: 15px;
}

.list {
  background-color: black !important;
}

.legend {
  z-index: 2;
  position: absolute;
  width: 100%;
  bottom: 40px;
  left: 15px;
  height: 100px;
  width: 100px;
  background: black;
  border: #222222 1px solid;
  box-shadow: 0px 10px 20px 2px #00000099;
  transition: 0.15s;
}
.legend:hover {
  height: 250px;
  width: 250px;
}
</style>