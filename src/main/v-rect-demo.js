const Vue = require("vue").default;
const FragmentPlugin = require("vue-fragment").Plugin;
const VScene = require("../v-scene").default;
const VRect = require("../v-rect").default;

Vue.use(FragmentPlugin);
const app = new Vue({
    el: "#vue-app",
    template: `<fragment>
        <v-scene :transparent="true" :view-width="width" :view-height="height"
            :view-pos-x="0" :view-pos-y="0" :real-min-x="0" :real-max-x="10"
            :real-min-y="10" :real-max-y="20" x-transform="linear" y-transform="linear">
            <v-rect 
                fill-color="rgba(255, 0, 0, 0.3)" 
                :real-min-x="2" 
                :real-max-x="6"
                line-color="#FF00FF"
                image-pattern-url="https://users.i2g.cloud/pattern/trait_rapproches_.png?service=WI_BACKEND"
                foregroundColor="red"
                backgroundColor="green"
                :line-width="1"
                :enabled="true"
                :draggable="true"
                :on-drop="dropFn"
                :onmousedown="click1"
                :real-min-y="13"
                :real-max-y="17">
            </v-rect>
        </v-scene>
        <button v-on:click="double">Click me</button>
    </fragment>
    `,
    data: {
        width: 600,
        height: 400,
        x: 100,
        y: 100,
        image: null
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
        VScene, VRect
    }
});
