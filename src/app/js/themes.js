/* KTM Timeline — theme presets. Each preset is a partial design merged over the current design. */
(function (K) {
  'use strict';
  function T(o) { return o; }
  var P = [
    { id: 'ktm', name: 'KTM Navy & Gold', swatch: ['#F8F9FB', '#232450', '#FEDC69'], design: T({
      typography: { family: 'Poppins', heading: { family: 'inherit', color: '#232450' }, title: { family: 'inherit', color: '#232450' }, date: { family: 'inherit', color: '#232450', transform: 'none' }, description: { family: 'inherit', color: '#4A4D6A' } },
      colors: { bgType: 'solid', background: '#F8F9FB', line: '#232450', marker: '#FEDC69', markerIcon: '#232450', markerBorder: '#232450', cardBg: '#FFFFFF', cardOpacity: 100, border: '#E3E5EE', dateBg: '#FEDC69', accent: '#232450', highlight: '#FEDC69', progress: '#232450', focus: '#232450' },
      structure: { markerShape: 'circle', dateStyle: 'pill', markerBorderWidth: 2 }, cards: { radius: 14, shadow: 'md', borderWidth: 1 } }) },
    { id: 'minimal', name: 'Minimal White', swatch: ['#FFFFFF', '#111827', '#D1D5DB'], design: T({
      typography: { family: 'Inter', heading: { family: 'inherit', color: '#111827' }, title: { family: 'inherit', color: '#111827' }, date: { family: 'inherit', color: '#6B7280', transform: 'uppercase' }, description: { family: 'inherit', color: '#4B5563' } },
      colors: { bgType: 'solid', background: '#FFFFFF', line: '#D1D5DB', marker: '#111827', markerIcon: '#FFFFFF', markerBorder: '#111827', cardBg: '#FFFFFF', cardOpacity: 100, border: '#E5E7EB', dateBg: '#F3F4F6', accent: '#111827', highlight: '#111827', progress: '#111827', focus: '#111827' },
      structure: { markerShape: 'circle', dateStyle: 'plain', markerBorderWidth: 0 }, cards: { radius: 8, shadow: 'none', borderWidth: 1 } }) },
    { id: 'blue', name: 'Modern Blue', swatch: ['#F5F8FF', '#2563EB', '#F59E0B'], design: T({
      typography: { family: 'DM Sans', heading: { family: 'inherit', color: '#0F1E4A' }, title: { family: 'inherit', color: '#0F1E4A' }, date: { family: 'inherit', color: '#1D4ED8', transform: 'none' }, description: { family: 'inherit', color: '#42506E' } },
      colors: { bgType: 'gradient', background: '#F5F8FF', gradFrom: '#F5F8FF', gradTo: '#E6EEFF', gradAngle: 180, line: '#2563EB', marker: '#2563EB', markerIcon: '#FFFFFF', markerBorder: '#FFFFFF', cardBg: '#FFFFFF', cardOpacity: 100, border: '#DBE6FE', dateBg: '#E0EAFF', accent: '#2563EB', highlight: '#F59E0B', progress: '#2563EB', focus: '#1D4ED8' },
      structure: { markerShape: 'circle', dateStyle: 'pill', markerBorderWidth: 3 }, cards: { radius: 16, shadow: 'md', borderWidth: 1 } }) },
    { id: 'pastel', name: 'Pastel Education', swatch: ['#FFF8F1', '#F4A9C0', '#B9E4C9'], design: T({
      typography: { family: 'Quicksand', heading: { family: 'inherit', color: '#2F4858' }, title: { family: 'inherit', color: '#2F4858' }, date: { family: 'inherit', color: '#6B4100', transform: 'none' }, description: { family: 'inherit', color: '#51606C' } },
      colors: { bgType: 'solid', background: '#FFF8F1', line: '#F4A9C0', marker: '#B9E4C9', markerIcon: '#2F4858', markerBorder: '#FFFFFF', cardBg: '#FFFFFF', cardOpacity: 100, border: '#F6D6E1', dateBg: '#FDE2B8', accent: '#B0446C', highlight: '#FFC48C', progress: '#E07A9B', focus: '#B0446C' },
      structure: { markerShape: 'circle', dateStyle: 'pill', markerBorderWidth: 3 }, cards: { radius: 22, shadow: 'sm', borderWidth: 2 } }) },
    { id: 'classroom', name: 'Colourful Classroom', swatch: ['#FFFDF5', '#EE6C4D', '#3D5A80'], design: T({
      typography: { family: 'Fredoka', heading: { family: 'inherit', color: '#293241' }, title: { family: 'inherit', color: '#293241' }, date: { family: 'inherit', color: '#10263B', transform: 'none' }, description: { family: 'inherit', color: '#465263' } },
      colors: { bgType: 'solid', background: '#FFFDF5', line: '#3D5A80', marker: '#EE6C4D', markerIcon: '#FFFFFF', markerBorder: '#FFFFFF', cardBg: '#FFFFFF', cardOpacity: 100, border: '#FFE1A8', dateBg: '#98C1D9', accent: '#C2412A', highlight: '#F4D35E', progress: '#EE6C4D', focus: '#3D5A80' },
      structure: { markerShape: 'circle', dateStyle: 'pill', markerBorderWidth: 3 }, cards: { radius: 18, shadow: 'md', borderWidth: 2, categoryAccent: true } }) },
    { id: 'dark', name: 'Dark Professional', swatch: ['#0F1220', '#181C2F', '#FEDC69'], design: T({
      typography: { family: 'Inter', heading: { family: 'inherit', color: '#FFFFFF' }, title: { family: 'inherit', color: '#F4F5FA' }, date: { family: 'inherit', color: '#FEDC69', transform: 'none' }, description: { family: 'inherit', color: '#B8BCD6' } },
      colors: { bgType: 'solid', background: '#0F1220', line: '#3A3F63', marker: '#FEDC69', markerIcon: '#0F1220', markerBorder: '#0F1220', cardBg: '#181C2F', cardOpacity: 100, border: '#2A2F4A', dateBg: '#262B47', accent: '#FEDC69', highlight: '#FEDC69', progress: '#FEDC69', focus: '#FEDC69' },
      structure: { markerShape: 'circle', dateStyle: 'pill', markerBorderWidth: 2 }, cards: { radius: 12, shadow: 'lg', borderWidth: 1 } }) },
    { id: 'historical', name: 'Warm Historical', swatch: ['#F6EFE3', '#8C5A3C', '#C9A227'], design: T({
      typography: { family: 'Lora', heading: { family: 'Playfair Display', color: '#3E2A1E' }, title: { family: 'Playfair Display', color: '#3E2A1E' }, date: { family: 'inherit', color: '#8C5A3C', transform: 'uppercase' }, description: { family: 'inherit', color: '#5E4A3A' } },
      colors: { bgType: 'solid', background: '#F6EFE3', line: '#8C5A3C', marker: '#8C5A3C', markerIcon: '#F6EFE3', markerBorder: '#F6EFE3', cardBg: '#FFFBF3', cardOpacity: 100, border: '#E3D3BA', dateBg: '#EADBC2', accent: '#7A4A2E', highlight: '#C9A227', progress: '#8C5A3C', focus: '#7A4A2E' },
      structure: { markerShape: 'diamond', dateStyle: 'plain', markerBorderWidth: 2 }, cards: { radius: 4, shadow: 'sm', borderWidth: 1 } }) },
    { id: 'mono', name: 'Monochrome', swatch: ['#FFFFFF', '#000000', '#777777'], design: T({
      typography: { family: 'Space Grotesk', heading: { family: 'inherit', color: '#000000' }, title: { family: 'inherit', color: '#000000' }, date: { family: 'inherit', color: '#FFFFFF', transform: 'uppercase' }, description: { family: 'inherit', color: '#222222' } },
      colors: { bgType: 'solid', background: '#FFFFFF', line: '#000000', marker: '#000000', markerIcon: '#FFFFFF', markerBorder: '#000000', cardBg: '#FFFFFF', cardOpacity: 100, border: '#000000', dateBg: '#000000', accent: '#000000', highlight: '#000000', progress: '#000000', focus: '#000000' },
      structure: { markerShape: 'square', dateStyle: 'pill', markerBorderWidth: 0 }, cards: { radius: 0, shadow: 'none', borderWidth: 2 } }) }
  ];
  function byId(id) { for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i]; return null; }
  function apply(design, id) { var p = byId(id); if (!p) return design; return K.model.deepMerge(design, JSON.parse(JSON.stringify(p.design))); }
  K.themes = { list: P, byId: byId, apply: apply };
})(window.KTM = window.KTM || {});
