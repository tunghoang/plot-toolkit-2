import Vue from 'vue';
import Vuex from 'vuex'
import VPlot from '../v-plot';
import { Fragment } from 'vue-fragment';
import VScene from '../v-scene';
import options from '../stores/logplot-store.js';

Vue.use(Vuex);
Vue.config.devtools = true

const store = new Vuex.Store(options);

let app = new Vue({
    el: "#vue-app",
    template: `
        <fragment>
            <v-scene
                v-if="show"
                :transparent="true" :view-width="viewWidth" :view-height="viewHeight"
                :view-pos-x="0" :view-pos-y="0">
                <v-plot
                    :enable-zone-ref="enableZoneRef"
                    :view-pos-x="0" :view-pos-y="0"
                    :view-width="viewWidth" :view-height="viewHeight"
                    :tooltip-style="tooltipStyle" ref="myPlot"
                    :zone-content-style="zoneContentStyle"
                    :enabled="true"
                    :id-project="12" :id-plot="345" />
            </v-scene>
            <button @click="toggleShow">Toggle show</button> <br/>
            <button @click="toggleZoneRef">{{enableZoneRef ? 'Disable Zone Ref Line' : 'Enable Zone Ref Line'}}</button>
        </fragment>
    `,
    data: function () {
        return {
            plotHeaderHeight: 100,
            tooltipStyle: {
                fontSize: 13
            },
            viewHeight: 500,
            viewWidth: 3000,
            zoneContentStyle: {
                fontSize: 14,
            },
            show: true,
            count: 0,
            enableZoneRef: true
        }
    },
    methods: {
        toggleShow: function () {
            if (!this.show) {
                this.count++;
            }
            this.show = !this.show
        },
        toggleZoneRef: function () {
            this.enableZoneRef = !this.enableZoneRef;
        }
    },
    components: {
        VPlot, VScene, Fragment
    },
    store: store
});