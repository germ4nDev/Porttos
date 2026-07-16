// mapbox-draw-styles.ts

// 1. Constantes para filtros repetitivos
const F_POLY_INACTIVE = ["all", ["==", "active", "false"], ["==", "$type", "Polygon"], ["!=", "mode", "static"]];
const F_POLY_ACTIVE = ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]];
const F_LINE_INACTIVE = ["all", ["==", "active", "false"], ["==", "$type", "LineString"], ["!=", "mode", "static"]];
const F_LINE_ACTIVE = ["all", ["==", "active", "true"], ["==", "$type", "LineString"]];
const F_PT_INACTIVE = ["all", ["==", "active", "false"], ["==", "$type", "Point"], ["==", "meta", "feature"], ["!=", "mode", "static"]];
const F_PT_ACTIVE = ["all", ["==", "active", "true"], ["==", "$type", "Point"], ["==", "meta", "feature"], ["!=", "mode", "static"]];
const F_VERTEX = ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]];
const F_MIDPOINT = ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]];
const F_STATIC_POLY = ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]];
const F_STATIC_LINE = ["all", ["==", "mode", "static"], ["==", "$type", "LineString"]];
const F_STATIC_PT = ["all", ["==", "mode", "static"], ["==", "$type", "Point"]];

const L_CAP_JOIN = { 'line-cap': 'round', 'line-join': 'round' };

// 2. Arreglos para líneas punteadas (usando "literal" para evitar errores de consola)
const DASHARRAY_ACTIVE = ["literal", [0.2, 2]];
const DASHARRAY_COLD = ["literal", [2, 2]];

// 3. Arreglo principal exportable
export const mapboxDrawStyles: any[] = [
    // --- A. CAPAS DE POLÍGONOS (Relleno y Bordes) ---
    { id: 'gl-draw-polygon-fill-inactive', type: 'fill', filter: F_POLY_INACTIVE, paint: { 'fill-color': '#0056b3', 'fill-outline-color': '#0056b3', 'fill-opacity': 0.6 } },
    { id: 'gl-draw-polygon-fill-active', type: 'fill', filter: F_POLY_ACTIVE, paint: { 'fill-color': '#d32f2f', 'fill-outline-color': '#d32f2f', 'fill-opacity': 0.6 } },
    { id: 'gl-draw-polygon-stroke-inactive', type: 'line', filter: F_POLY_INACTIVE, layout: L_CAP_JOIN, paint: { 'line-color': '#003d80', 'line-width': 2.5 } },
    { id: 'gl-draw-polygon-stroke-active', type: 'line', filter: F_POLY_ACTIVE, layout: L_CAP_JOIN, paint: { 'line-color': '#b71c1c', 'line-dasharray': DASHARRAY_ACTIVE, 'line-width': 3 } },

    // --- B. CAPAS DE LÍNEAS REGULARES ---
    { id: 'gl-draw-line-inactive', type: 'line', filter: F_LINE_INACTIVE, layout: L_CAP_JOIN, paint: { 'line-color': '#3b9ddd', 'line-width': 2 } },
    { id: 'gl-draw-line-active', type: 'line', filter: F_LINE_ACTIVE, layout: L_CAP_JOIN, paint: { 'line-color': '#fbb03b', 'line-dasharray': DASHARRAY_ACTIVE, 'line-width': 2 } },

    // --- C. CAPAS TEMPORALES (hot y cold) ---
    { id: 'gl-draw-lines.cold', type: 'line', filter: ['all', ['==', '$type', 'LineString'], ['==', 'meta', 'cold']], layout: L_CAP_JOIN, paint: { 'line-color': '#3b9ddd', 'line-dasharray': DASHARRAY_COLD, 'line-width': 2 } },
    { id: 'gl-draw-lines.hot', type: 'line', filter: ['all', ['==', '$type', 'LineString'], ['==', 'meta', 'hot']], layout: L_CAP_JOIN, paint: { 'line-color': '#fbb03b', 'line-dasharray': DASHARRAY_ACTIVE, 'line-width': 2 } },

    // --- D. CAPAS DE PUNTOS SIMPLES ---
    { id: 'gl-draw-point-point-stroke-inactive', type: 'circle', filter: F_PT_INACTIVE, paint: { 'circle-radius': 5, 'circle-opacity': 1, 'circle-color': '#fff' } },
    { id: 'gl-draw-point-inactive', type: 'circle', filter: F_PT_INACTIVE, paint: { 'circle-radius': 3, 'circle-color': '#3b9ddd' } },
    { id: 'gl-draw-point-stroke-active', type: 'circle', filter: F_PT_ACTIVE, paint: { 'circle-radius': 7, 'circle-color': '#fff' } },
    { id: 'gl-draw-point-active', type: 'circle', filter: F_PT_ACTIVE, paint: { 'circle-radius': 5, 'circle-color': '#fbb03b' } },

    // --- E. CAPAS MODO ESTÁTICO ---
    { id: 'gl-draw-polygon-fill-static', type: 'fill', filter: F_STATIC_POLY, paint: { 'fill-color': '#404040', 'fill-outline-color': '#404040', 'fill-opacity': 0.1 } },
    { id: 'gl-draw-polygon-stroke-static', type: 'line', filter: F_STATIC_POLY, layout: L_CAP_JOIN, paint: { 'line-color': '#404040', 'line-width': 2 } },
    { id: 'gl-draw-line-static', type: 'line', filter: F_STATIC_LINE, layout: L_CAP_JOIN, paint: { 'line-color': '#404040', 'line-width': 2 } },
    { id: 'gl-draw-point-static', type: 'circle', filter: F_STATIC_PT, paint: { 'circle-radius': 5, 'circle-color': '#404040' } },

    // --- F. VÉRTICES Y PUNTOS MEDIOS (SIEMPRE AL FINAL PARA QUE NO SE TAPEN) ---
    { id: 'gl-draw-polygon-midpoint', type: 'circle', filter: F_MIDPOINT, paint: { 'circle-radius': 6, 'circle-color': '#ff0000' } },
    { id: 'gl-draw-polygon-and-line-vertex-stroke-inactive', type: 'circle', filter: F_VERTEX, paint: { 'circle-radius': 5, 'circle-color': '#fff' } },
    { id: 'gl-draw-polygon-and-line-vertex-inactive', type: 'circle', filter: F_VERTEX, paint: { 'circle-radius': 3, 'circle-color': '#fbb03b' } },
    { id: 'gl-draw-polygon-and-line-vertex-halo-active', type: 'circle', filter: F_VERTEX, paint: { 'circle-radius': 7, 'circle-color': '#FFF' } },
    { id: 'gl-draw-polygon-and-line-vertex-active', type: 'circle', filter: F_VERTEX, paint: { 'circle-radius': 4, 'circle-color': '#D20C0C' } }
];
