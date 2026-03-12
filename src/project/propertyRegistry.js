export const PROPERTY_TYPES = {
  number: 'number',
  color: 'color',
  step: 'step',
}

export const ANIMATABLE_PROPERTIES = [
  // Position & Transform
  { id: 'left', label: 'X', type: PROPERTY_TYPES.number, group: 'position' },
  { id: 'top', label: 'Y', type: PROPERTY_TYPES.number, group: 'position' },
  { id: 'scaleX', label: 'Scale X', type: PROPERTY_TYPES.number, group: 'transform' },
  { id: 'scaleY', label: 'Scale Y', type: PROPERTY_TYPES.number, group: 'transform' },
  { id: 'width', label: 'Width', type: PROPERTY_TYPES.number, group: 'size' },
  { id: 'height', label: 'Height', type: PROPERTY_TYPES.number, group: 'size' },
  { id: 'angle', label: 'Rotation', type: PROPERTY_TYPES.number, group: 'transform' },
  { id: 'opacity', label: 'Opacity', type: PROPERTY_TYPES.number, group: 'appearance' },

  // Appearance
  { id: 'fill', label: 'Fill', type: PROPERTY_TYPES.color, group: 'appearance' },
  { id: 'stroke', label: 'Stroke', type: PROPERTY_TYPES.color, group: 'appearance' },
  { id: 'strokeWidth', label: 'Stroke Width', type: PROPERTY_TYPES.number, group: 'appearance' },
  { id: 'rx', label: 'Corner Radius X', type: PROPERTY_TYPES.number, group: 'appearance' },
  { id: 'ry', label: 'Corner Radius Y', type: PROPERTY_TYPES.number, group: 'appearance' },

  // Shadow
  { id: 'shadow.color', label: 'Shadow Color', type: PROPERTY_TYPES.color, group: 'shadow' },
  { id: 'shadow.opacity', label: 'Shadow Opacity', type: PROPERTY_TYPES.number, group: 'shadow' },
  { id: 'shadow.offsetX', label: 'Shadow X', type: PROPERTY_TYPES.number, group: 'shadow' },
  { id: 'shadow.offsetY', label: 'Shadow Y', type: PROPERTY_TYPES.number, group: 'shadow' },
  { id: 'shadow.blur', label: 'Shadow Blur', type: PROPERTY_TYPES.number, group: 'shadow' },

  // Typography
  { id: 'charSpacing', label: 'Character Spacing', type: PROPERTY_TYPES.number, group: 'text' },
  { id: 'lineHeight', label: 'Line Height', type: PROPERTY_TYPES.number, group: 'text' },

  // Filters (CSS-style)
  { id: 'filter.brightness', label: 'Brightness', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.contrast', label: 'Contrast', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.saturate', label: 'Saturation', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.blur', label: 'Blur', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.grayscale', label: 'Grayscale', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.sepia', label: 'Sepia', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.hueRotate', label: 'Hue Rotate', type: PROPERTY_TYPES.number, group: 'filter' },
  { id: 'filter.invert', label: 'Invert', type: PROPERTY_TYPES.number, group: 'filter' },
]

const propertyMap = new Map(
  ANIMATABLE_PROPERTIES.map((entry) => [entry.id, entry])
)

export function getAnimatableProperty(id) {
  return propertyMap.get(id) ?? null
}

export function isAnimatableProperty(id) {
  return propertyMap.has(id)
}

export function listAnimatablePropertyIds() {
  return ANIMATABLE_PROPERTIES.map((entry) => entry.id)
}

export function listPropertiesByGroup(group) {
  return ANIMATABLE_PROPERTIES.filter((entry) => entry.group === group)
}

// Filter preset definitions
export const FILTER_PRESETS = [
  { id: 'none', label: 'None', values: {} },
  { id: 'warm', label: 'Warm', values: { 'filter.brightness': 105, 'filter.saturate': 120, 'filter.sepia': 15, 'filter.hueRotate': -5 } },
  { id: 'cool', label: 'Cool', values: { 'filter.brightness': 100, 'filter.saturate': 90, 'filter.hueRotate': 15 } },
  { id: 'vintage', label: 'Vintage', values: { 'filter.brightness': 110, 'filter.contrast': 90, 'filter.saturate': 70, 'filter.sepia': 30 } },
  { id: 'bw', label: 'B&W', values: { 'filter.grayscale': 100 } },
  { id: 'cinematic', label: 'Cinematic', values: { 'filter.contrast': 120, 'filter.saturate': 85, 'filter.brightness': 95 } },
  { id: 'neon', label: 'Neon', values: { 'filter.brightness': 110, 'filter.contrast': 130, 'filter.saturate': 160 } },
  { id: 'dreamy', label: 'Dreamy', values: { 'filter.brightness': 108, 'filter.blur': 1, 'filter.saturate': 130 } },
  { id: 'dramatic', label: 'Dramatic', values: { 'filter.contrast': 140, 'filter.brightness': 90, 'filter.saturate': 110 } },
  { id: 'faded', label: 'Faded', values: { 'filter.brightness': 115, 'filter.contrast': 85, 'filter.saturate': 60 } },
]
