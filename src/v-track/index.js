import { Fragment } from 'vue-fragment';
import { Text } from 'pixi.js';
import VPath from '../v-path';
import VRect from '../v-rect';
import VContainer from '../v-container';
import VResizable from '../v-resizable';
import VViewport from '../v-viewport';
import VCartersian, { VCartersianFactory } from '../v-cartersian';
import VTextbox from '../v-textbox';
import VHeaderCurve from '../v-header-curve';
import template from './template.html';
import VShape from '../v-shape';
import { scaleLinear } from 'd3';

let component = {
    props: {
        trackRealMinY: {
            type: Number
        },
        trackRealMaxY: {
            type: Number
        },
        trackHeaderFillColor: {
            default: 0xFFFFFF
        },
        trackHeaderHeight: {
            type: Number,
            default: 100
        },
        trackHeaderResize: {
            type: Function
        },
        genTooltip: {
            type: Function
        },
        knobFlags: {
            type: Array,
            default: () => [false, true]
        },
        direction: {
            type: String,
            default: "horizontal"
        }
    },
    computed: {
        componentType: function () {
            return "VTrack";
        },
        checkShading: function () {
            let check = false;
            this.visualizeItems.forEach(item => {
                item.shading ? check = item.shading : check;
            })
            return check;
        },
    },
    data: function () {
        return {
            kursor: "default",
            scaleTrackHeight: 0,
            trackChilren: null,
            trackHeaderChildrenHeight: 0,
            headerContentStyle: {
                fontFamily: 'Arial',
                fontStyle: 'italic',
                align: 'center',
                padding: 5,
                fontSize: 13,
            },
            childrenHeaderPosYList: [0],
            shadingColor: '',
            visualizeItems: [],
            pathList: []
        }
    },
    template,
    components: {
        VPath, VRect, VResizable, VViewport, VHeaderCurve,
        VContainer, VCartersian, Fragment, VTextbox, VShape,
        VCartersianExtMouse: VCartersianFactory({ extMouseListener: true })
    },
    methods: {
        childHighlight: function (target, localPos, globalPos, evt) {
            let name = target.hostComponent.name.split(" ");
            let idx = Number(name[name.length - 1]);
            let compType = this.visualizeItems[idx]["comp"];
            console.log(compType);
            let comp = this.$refs.trackChildren.$children[idx];
            if (!this.visualizeItems[idx].shading) {
                this.visualizeItems = this.visualizeItems.map((item, index) => {
                    return {
                        ...item,
                        shading: index !== idx ? false : true
                    }
                });
                this.shadingColor = this.visualizeItems[idx].color;
                this.pathList = [];
                switch (compType) {
                    case "VShading":
                        this.pathList.push(comp.shadingPathLeft, comp.shadingPathRight);
                        break;
                    case "VPath":
                    case "VCurve":
                        this.pathList.push(comp.realPath);
                        break;
                }
            } else {
                this.visualizeItems[idx].shading = false;
                this.pathList = [];
            }
        },
        textWidth: function (content) {
            let text = new Text(content);
            let textWidth = text.getLocalBounds().width * this.headerContentStyle.fontSize / 26;
            return textWidth;
        },
        textHeight: function (content) {
            let text = new Text(content);
            let textHeight = text.getLocalBounds().height * this.headerContentStyle.fontSize / 26;
            return textHeight;
        },
        onTrackMouseDown: function (target, localPos, globalPos, evt) {
            let { x, y } = localPos;
            let xLeft = x - 2, xRight = x + 2, yLeft = y - 2, yRight = y + 2;
            let pixelPathLeft, pixelPathRight, pixelPath, child;
            let xPos, check = false;
            for (let i = 0; i < this.$refs.trackChildren.$children.length; i++) {
                child = this.$refs.trackChildren.$children[i];
                switch (child.componentType) {
                    case "VShading":
                        let idx = null;
                        if (!Array.isArray(child.realLeft)) {
                            xPos = this.$refs.viewportBody.transformX(child.realLeft);
                            pixelPathRight = this.transformPath(child.realRight);
                            for (let j = 0; j < pixelPathRight.length - 1; j++) {
                                if (pixelPathRight[j].y <= y && pixelPathRight[j + 1].y >= y) {
                                    idx = j;
                                    break;
                                }
                            }
                            if (idx !== null) {
                                let { a, b } = this.getLinearLine(pixelPathRight[idx], pixelPathRight[idx + 1]);
                                let x1 = (y - b) / a;
                                if ((xPos < x && x < x1) || (xPos > x && x > x1)) {
                                    if (!this.visualizeItems[i].shading) {
                                        this.visualizeItems[i].shading = true;
                                        this.pathList.push([
                                            { x: child.realLeft, y: child.realRight[0].y },
                                            { x: child.realLeft, y: child.realRight[child.realRight.length - 1].y }
                                        ], child.realRight);
                                        check = true;
                                        return;
                                    }
                                }
                            }
                        } else if (!Array.isArray(child.realRight)) {
                            xPos = this.$refs.viewportBody.transformX(child.realRight);
                            pixelPathLeft = this.transformPath(child.realLeft);
                            for (let j = 0; j < pixelPathLeft.length - 1; j++) {
                                if (pixelPathLeft[j].y <= y && pixelPathLeft[j + 1].y >= y) {
                                    idx = j;
                                    break;
                                }
                            }
                            if (idx !== null) {
                                let { a, b } = this.getLinearLine(pixelPathLeft[idx], pixelPathLeft[idx + 1]);
                                let x1 = (y - b) / a;
                                if (xPos < x && x < x1 || (xPos > x && x > x1)) {
                                    if (!this.visualizeItems[i].shading) {
                                        this.visualizeItems[i].shading = true;
                                        this.pathList.push([
                                            { x: child.realRight, y: child.realLeft[0].y },
                                            { x: child.realRight, y: child.realLeft[child.realLeft.length - 1].y }
                                        ], child.realRight);
                                        check = true;
                                    }
                                    return;
                                }
                            }
                        } else {
                            pixelPathLeft = this.transformPath(child.realLeft);
                            pixelPathRight = this.transformPath(child.realRight);
                            for (let j = 0; j < pixelPathLeft.length - 1; j++) {
                                if (pixelPathLeft[j].y <= y && pixelPathLeft[j + 1].y >= y) {
                                    idx = j;
                                    break;
                                }
                            }
                            if (idx !== null) {
                                let { a1, b1 } = this.getLinearLine(pixelPathLeft[idx], pixelPathLeft[idx + 1], 1);
                                let { a2, b2 } = this.getLinearLine(pixelPathRight[idx], pixelPathRight[idx + 1], 2);
                                console.log(a1, b1, a2, b2)
                                let x1 = Math.min((y - b1) / a1, (y - b2) / a2);
                                let x2 = Math.max((y - b1) / a1, (y - b2) / a2);
                                console.log(x, x1, x2);
                                if (x1 < x && x < x2) {
                                    if (!this.visualizeItems[i].shading) {
                                        this.visualizeItems[i].shading = true;
                                        this.pathList.push(child.realLeft, child.realRight);
                                        check = true;
                                        return;
                                    }
                                }
                            }
                        }
                        break;
                    case "VCurve":
                        let index = null;
                        pixelPath = this.transformPath(child.realPath);
                        for (let j = 0; j < pixelPath.length; j++) {
                            if (pixelPath[j].y <= y && pixelPath[j + 1].y >= y) {
                                index = j;
                                break;
                            }
                        }
                        if (index !== null) {
                            let { a, b } = this.getLinearLine(pixelPath[index], pixelPath[index + 1]);
                            let distance = Math.abs(a * x - y + b) / Math.sqrt(a * a + b * b);
                            if ((a * x + b === y) || distance < 2) {
                                if (!this.visualizeItems[i].shading) {
                                    this.visualizeItems[i].shading = true;
                                    this.pathList.push(child.realPath);
                                    check = true;
                                    return;
                                }
                            }
                        }
                        break;
                }
            }
            if (!check) {
                this.visualizeItems = this.visualizeItems.map(item => {
                    return {
                        ...item,
                        shading: false
                    }
                });
                this.pathList = [];
            }
        },
        getPosX: function (posX) {
            return this.$refs.viewportBody.transformX(posX);
        },
        getPosY: function (posY) {
            return this.$refs.viewportBody.transformY(posY);
        },
        transformPath: function (realPath) {
            return realPath.map(point => {
                return {
                    x: this.getPosX(point.x),
                    y: this.getPosY(point.y)
                }
            })
        },
        getLinearLine: function (point1, point2, num = 0) {
            let res = {};
            let a = (point1["y"] - point2['y']) / (point1["x"] - point2["x"]);
            let b = point1["y"] - a * point1["x"];
            num ? res[`a${num}`] = a : res['a'] = a;
            num ? res[`b${num}`] = b : res['b'] = b;
            return res;
        }
    },
    mounted: function () {
        if (this.trackRealMinY >= this.trackRealMaxY) {
            throw new Error(`Error in VTrack with range: ${this.trackRealMinY} and ${this.trackRealMaxY}`);
        }
        console.log("Track draw");
        let children = this.$refs.trackChildren.$children;
        const y = (this.viewHeight - this.trackHeaderHeight) * (this.realMaxY - this.realMinY)
            / (this.trackRealMaxY - this.trackRealMinY);
        this.scaleTrackHeight = y;
        let transformFn = scaleLinear().domain([this.realMinY, this.realMaxY]).range([0, y]);
        this.$refs.viewportBody.offsetY -= transformFn(this.trackRealMinY);

        let compProp = "", height = 0, obj;
        this.visualizeItems.push(...children.map((child, idx) => {
            compProp = child.componentType;
            height = compProp === "VShading" ? 30 : 60;
            this.trackHeaderChildrenHeight += height;
            idx === 0 ? this.childrenHeaderPosYList.push(height) : this.childrenHeaderPosYList.push(height + this.childrenHeaderPosYList[idx]);
            obj = {
                comp: compProp,
                height,
                name: child.name || compProp,
                color: child.symbolColor || 255,
                shading: false
            }
            if (compProp === "VCurve") {
                let { lineDash, leftValue, rightValue, unit } = child;
                return {
                    ...obj,
                    leftValue,
                    rightValue,
                    unit,
                    lineDash,

                }
            }
            if (compProp === "VShading") {
                let { minColor, maxColor, typeFillColor, pallete, curveLowValue, curveHighValue } = child;
                return {
                    ...obj,
                    minColor,
                    maxColor,
                    typeFillColor,
                    pallete,
                    curveLowValue,
                    curveHighValue
                }
            }
            return obj;
        }));
        this.childrenHeaderPosYList.pop();

    }
}

export default VResizable.extend(component);