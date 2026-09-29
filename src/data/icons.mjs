/*
 * 图标库（内联 SVG，线条风格）。
 * 新增图标只要在这里加一条 name: '内部路径'，图标组件和计算器会自动认到。
 * 统一 24x24 视窗、1.5px 描边、颜色跟随 currentColor。
 */

export const ICONS = {
  // 输入区
  pin:
    '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  clock:
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  sliders:
    '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
  // 结果区
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/>',
  copy:
    '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M6.5 15H5.5A1.5 1.5 0 0 1 4 13.5v-8A1.5 1.5 0 0 1 5.5 4h8A1.5 1.5 0 0 1 15 5.5v1"/>',
  // 五行
  wood:
    '<path d="M12 3v18"/><path d="M12 9c0-3 2-5 5-5.5C16.5 6.6 15 9 12 9zM12 14c0-3-2-5-5-5.5C7.5 11.6 9 14 12 14z"/>',
  fire:
    '<path d="M12 3s5 4.5 5 8.6A5 5 0 0 1 7 11.6C7 9 9 6.6 12 3z"/><path d="M12 20a2.8 2.8 0 0 0 2.8-2.8c0-1.6-1.3-2.7-2.8-4.7-1.5 2-2.8 3.1-2.8 4.7A2.8 2.8 0 0 0 12 20z"/>',
  earth:
    '<path d="M3 19h18"/><path d="M3 19 8 7l4 8 3-5 6 9"/>',
  metal:
    '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/>',
  water:
    '<path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11z"/>',
};

const OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">';

export function svgFor(name) {
  const inner = ICONS[name];
  if (!inner) return '';
  return OPEN + inner + '</svg>';
}
