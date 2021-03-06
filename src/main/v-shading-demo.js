const Vue = require("vue").default;
const FragmentPlugin = require("vue-fragment").Plugin;
const VScene = require("../v-scene").default;
const VPolygon = require("../v-polygon").default;
import data from "./data-polygon";

Vue.use(FragmentPlugin);
const app = new Vue({
    el: "#vue-app",
    template: `<fragment>
        <v-scene :transparent="true" 
            :view-width="width" :view-height="height"
            :view-pos-x="0" :view-pos-y="0" 
            :real-min-x="0" :real-max-x="50"
            :real-min-y="0" :real-max-y="3500" 
            x-transform="linear" y-transform="linear"
        >
            <v-polygon 
                fill-color="rgba(255, 0, 0, 0.3)" 
                :real-min-x="0" :real-max-x="30"
                line-color="#FF00FF"
                image-pattern-url="src/main/trait_rapproches_.png"
                foregroundColor="red"
                backgroundColor="green"
                :path="path1"
                :isShading="true"
                shadingSide="left"
                :line-width="1"
                :enabled="true"
                :on-drop="dropFn"
                :onmousedown="click1"
                :real-min-y="0" :real-max-y="3500">
            </v-polygon>
        </v-scene>
    </fragment>
    `,
    data: {
        width: 140.98,
        height: 482,
        x: 100,
        y: 100,
        image: null,
        path1: [
            6.32, 0, 12.32, 1200, 8.5, 2000, 20.32, 2500, 15.32, 3200
        ]
    },
    created() {
    },
    methods: {
        double: function (evt) {
            this.x += 10;
            this.y += 10;
        },
        click1: function (target, localPos, globalPos, evt) {
            target.hostComponent.$nextTick(() => {
                target.zIndex++;
            });
        },
        dropFn: function (target, pos) {
            if (pos.x !== undefined) this.x = pos.x;
            if (pos.y !== undefined) this.y = pos.y;
        }
    },
    components: {
        VScene, VPolygon
    }
});
