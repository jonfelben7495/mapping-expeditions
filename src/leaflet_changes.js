import L from "leaflet";
import {IconDefault} from "leaflet/src/layer/marker/Icon.Default";
import {Icon} from "leaflet/src/layer/marker/Icon";
import * as DomUtil from "leaflet/src/dom/DomUtil";

export let IconDefault = Icon.extend({

    options: {
        iconUrl:       'marker-icon.png',
        iconRetinaUrl: 'marker-icon-2x.png',
        shadowUrl:     'marker-shadow.png',
        iconSize:    [25, 41],
        iconAnchor:  [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize:  [41, 41]
    },

    _getIconUrl: function (name) {
        if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
            IconDefault.imagePath = this._detectIconPath();
        }

        // @option imagePath: String
        // `Icon.Default` will try to auto-detect the location of the
        // blue icon images. If you are placing these images in a non-standard
        // way, set this option to point to the right path.
        var url = (this.options.imagePath || L.Icon.Default.imagePath);
        return url.slice(0, - 2);
    },

    _detectIconPath: function () {
        var el = DomUtil.create('div',  'leaflet-default-icon-path', document.body);
        var path = DomUtil.getStyle(el, 'background-image') ||
            DomUtil.getStyle(el, 'backgroundImage');	// IE8

        document.body.removeChild(el);

        if (path === null || path.indexOf('url') !== 0) {
            path = '';
        } else {
            path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
        }

        return path;
    }
});