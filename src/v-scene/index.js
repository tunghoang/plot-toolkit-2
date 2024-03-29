import { Fragment } from 'vue-fragment';
import { autoDetectRenderer, utils, Container } from 'pixi.js';
import template from './template.html';
import style from './style.less';
import layoutMixin from '../mixins/layout';
import { debounce } from 'lodash';
import baseObject from '../mixins/base-object';
import { EventEmitter } from '@pixi/utils';

function getPixiApp(force) {
    if (!this.pixiApp || force) {
        const renderer = autoDetectRenderer({
            width: this.width || 800,
            height: this.height || 600,
            transparent: this.transparent,
            antialias: true
        });
        renderer.view.onwheel = (evt) => {
            this.getEventManager().emit('wheel', evt);
        }
        const stage = new Container();
        stage.sortableChildren = true;
        stage.hostComponent = this;
        this.pixiApp = {
            renderer, stage,
            transparent: this.transparent
        };
    }
    return this.pixiApp;
}
function getPixiObj() {
    return (this.getPixiApp() || { }).stage;
}
function rawRenderGraphic(obj) {
    let app = this.getPixiApp();
    if (obj) {
        obj.render(app.renderer);
    } else app.renderer.render(obj || app.stage);
}
/*function renderGraphic(obj) {
    let app = this.getPixiApp();
    app.renderer.render(obj || app.stage);
}*/

let component = {
    props: ['transparent'],
    components: {
        Fragment
    },
    // template,
    mounted: function () {
        this.$el.appendChild(this.getPixiApp().renderer.view)
    },
    computed: {
        componentType: function () {
            return "VScene";
        },
    },
    eventManager: null,
    methods: {
        getPixiApp, getPixiObj,
        getEventManager: function () {
            if (!this.eventManager) {
                this.eventManager = new EventEmitter()
            }
            return this.eventManager;
        },
        getRenderer: function () {
            return this.getPixiApp().renderer;
        },
        getRoot: function () {
            return this.getPixiApp().stage;
        },
        getRootComp: function () {
            return this;
        },
        getParent: function () {
            return this;
        },
        rawRenderGraphic,
        renderGraphic: debounce(rawRenderGraphic, 100)
    },
    watch: {
        compProps: function () {
            let view = this.getPixiApp().renderer.view;
            this.$el.removeChild(view);
            let app = this.getPixiApp(true);
            this.$el.appendChild(app.renderer.view);
        }
    },
    mixins: [layoutMixin, baseObject]
};

// export default VObject.extend(component);
export default component;
