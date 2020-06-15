import Vue from 'vue';
import {Fragment} from 'vue-fragment';
import VScene from '../v-scene';
import VImage from '../v-image';
import VRect from '../v-rect';
import VTextbox from "../v-textbox";

new Vue({
    el: '#vue-app',
    template: `
        <fragment>
            <v-scene :view-width="800" :view-height="600" :transparent="true">
                <v-rect :clipped="true" :view-width="700" :view-height="500" :line-width="1" line-color="red" fill-color="0xFFFFFF01">
                    <v-image :scaled="scaled" :clipped="true" :centering="centering" :view-width="400" :view-height="300" :image-url="imageURL">
                        <v-textbox :view-pos-x="100" :view-pos-y="80" content="What" :content-style="style" :line-width="1" line-color="red" fill-color="yellow"></v-textbox>
                    </v-image>
                </v-rect>
            </v-scene>
            <button @click="urlIdx = (urlIdx + 1) % 2">change</button>
            <button @click="centering = !centering">centering</button>
            <button @click="scaled = !scaled">scaled</button>
        </fragment>
    `,
    computed: {
        imageURL() {
            return this.imageURLs[this.urlIdx];
        }
    },
    data: {
        urlIdx: 0,
        centering: false,
        scaled: false,
        style: {
            fontColor: 'blue'
        },
        imageURLs: [
            "data:image/jpeg;base64,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",



            "data:image/jpeg;base64,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",
        ],
    },
    methods: {
    },
    components: { VScene, VImage, VTextbox, VRect, Fragment }
});
