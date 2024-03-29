import { Text, TextStyle, Texture } from "pixi.js";
import {
  getColor,
  DefaultValues,
  blendColorImage,
  getImagePattern,
  processColorStr,
  getTransparency,
  getPosX,
  getPosY,
} from "../utils";
import { scaleLinear, scaleQuantile } from "d3-scale";
import layoutMixin from '../mixins/layout';
import selectable from '../mixins/selectable';
import baseShape from './base-shape'

async function drawRect(obj, align = 0) {
  obj.clear();
  let lw = this.lineWidth || 0;
  let lt = this.lineTransparency || 1.0;
  let fillFlag = false;
  if (this.hasMouseOver) {
    lw = lw ? (lw + 4) : 0;
    lt /= 2;
  }

  if (this.typeFillColor) {
    let transformFn;
    switch (this.typeFillColor) {
      case "Gradient":
        if (!this.minColor || !this.maxColor) {
          throw new Error(`No sufficient information for VRect typeFillColor
                      ${this.typeFillColor} with: ${this.minColor} and ${this.maxColor}`);
        }
        transformFn = scaleLinear().domain([0, this.viewWidth]).range([this.minColor, this.maxColor]);
        break;
      case "Palette":
        let myPalette = this.palette.map(p => `rgba(${p["red"]}, ${p["green"]}, ${p["blue"]}, ${p["alpha"]})`);
        if (!this.palette) {
          throw new Error(`No sufficient information for VRect typeFillColor
                  ${this.typeFillColor} with: ${this.palette}`);
        }
        transformFn = scaleQuantile().domain([0, this.viewWidth]).range(myPalette);
        break;
    }
    if (transformFn) {
      fillFlag = true
      let polygon, myFillColor, posXFillColor;
      for (let i = 0; i <= this.viewWidth; i += 1) {
        polygon = [i, 0, i + 1, 0, i + 1, this.viewHeight, i, this.viewHeight];
        posXFillColor = i;
        myFillColor = processColorStr(transformFn(posXFillColor));
        obj.beginFill(
          myFillColor.color,
          myFillColor.transparency
        );
        obj.drawPolygon(polygon);
        obj.endFill();
      }
    }
  } else {
    let myFillColor;
    if (this.isSelected) {
      myFillColor = processColorStr(0xF0F000, DefaultValues.fillColor, 0.2);
      obj.beginFill(myFillColor.color, myFillColor.transparency);
    } else {
      obj.beginFill(
        this.cFillColor.color,
        this.cFillColor.transparency,
        this.fillTexture
      );
    }
  }

  if (this.imagePatternUrl) {
    let imagePattern = await getImagePattern(this.imagePatternUrl);
    let canvas = blendColorImage(imagePattern, this.cForegroundColor, this.cBackgroundColor);

    const texture = Texture.from(canvas);
    obj.beginTextureFill(texture);
  } else {
    if (!fillFlag && this.backgroundColor) {
      let myFillColor = processColorStr(this.backgroundColor);
      obj.beginFill(myFillColor.color, myFillColor.transparency)
    }
  }

  obj.lineStyle(lw, this.cLineColor.color, this.cLineColor.transparency, align);
  obj.drawRect(0, 0, this.width || 0, this.height || 0);

  obj.endFill();
  obj.x = getPosX(this.coordinate, this.posX);
  obj.y = getPosY(this.coordinate, this.posY);
  obj.rotation = this.rotation || 0;
}

export default {
  props: [
    "typeFillColor",
    "minColor",
    "maxColor",
    "palette"
  ],
  computed: {
    componentType: function () {
      return this.componentTypePrefix + " VRect";
    }
  },
  methods: {
    drawRect,
    draw: drawRect
  },
  mixins: [layoutMixin, selectable, baseShape],
}