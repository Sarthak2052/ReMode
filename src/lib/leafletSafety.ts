/**
 * Leaflet React Lifecycle Safety Patch
 * Fixes: "TypeError: Cannot read properties of undefined (reading '_leaflet_pos')"
 * 
 * In React Fast Refresh / dynamic mounting, Leaflet's zoom transition timer
 * (_onZoomTransitionEnd via setTimeout) can fire after the map container or
 * pane DOM nodes have been unmounted or deleted by map.remove().
 */

import type LeafletType from "leaflet";

let isPatched = false;

export function patchLeafletSafety(L: typeof LeafletType) {
  if (isPatched || !L || typeof window === "undefined") return;
  isPatched = true;

  // 1. Guard DomUtil.getPosition against null/undefined element
  if (L.DomUtil) {
    const origGetPosition = L.DomUtil.getPosition;
    L.DomUtil.getPosition = function (el: HTMLElement | null | undefined): LeafletType.Point {
      if (!el) {
        return new L.Point(0, 0);
      }
      try {
        return origGetPosition ? origGetPosition(el) : ((el as any)._leaflet_pos || new L.Point(0, 0));
      } catch {
        return new L.Point(0, 0);
      }
    };
  }

  // 2. Guard Map prototype _getMapPanePos against deleted _mapPane
  if (L.Map && (L.Map.prototype as any)._getMapPanePos) {
    const origGetMapPanePos = (L.Map.prototype as any)._getMapPanePos;
    (L.Map.prototype as any)._getMapPanePos = function (): LeafletType.Point {
      if (!this._mapPane) {
        return new L.Point(0, 0);
      }
      try {
        return origGetMapPanePos.call(this);
      } catch {
        return new L.Point(0, 0);
      }
    };
  }

  // 3. Guard Map prototype _onZoomTransitionEnd against missing _mapPane
  if (L.Map && (L.Map.prototype as any)._onZoomTransitionEnd) {
    const origOnZoomTransitionEnd = (L.Map.prototype as any)._onZoomTransitionEnd;
    (L.Map.prototype as any)._onZoomTransitionEnd = function () {
      if (!this._animatingZoom || !this._mapPane) {
        this._animatingZoom = false;
        return;
      }
      try {
        origOnZoomTransitionEnd.call(this);
      } catch {
        this._animatingZoom = false;
      }
    };
  }

  // 4. Ensure Map.remove cancels pending zoom transitions
  if (L.Map && L.Map.prototype.remove) {
    const origRemove = L.Map.prototype.remove;
    L.Map.prototype.remove = function () {
      try {
        this.stop();
      } catch {}
      (this as any)._animatingZoom = false;
      return origRemove.call(this);
    };
  }
}
