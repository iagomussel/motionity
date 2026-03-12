export const PROPERTY_TYPES = {
  number: 'number',
  color: 'color',
  step: 'step',
}

export const ANIMATABLE_PROPERTIES = [
  { id: 'left', label: 'X', type: PROPERTY_TYPES.number },
  { id: 'top', label: 'Y', type: PROPERTY_TYPES.number },
  { id: 'scaleX', label: 'Scale X', type: PROPERTY_TYPES.number },
  { id: 'scaleY', label: 'Scale Y', type: PROPERTY_TYPES.number },
  { id: 'width', label: 'Width', type: PROPERTY_TYPES.number },
  { id: 'height', label: 'Height', type: PROPERTY_TYPES.number },
  { id: 'angle', label: 'Rotation', type: PROPERTY_TYPES.number },
  { id: 'opacity', label: 'Opacity', type: PROPERTY_TYPES.number },
  { id: 'fill', label: 'Fill', type: PROPERTY_TYPES.color },
  { id: 'stroke', label: 'Stroke', type: PROPERTY_TYPES.color },
  { id: 'strokeWidth', label: 'Stroke Width', type: PROPERTY_TYPES.number },
  { id: 'shadow.color', label: 'Shadow Color', type: PROPERTY_TYPES.color },
  { id: 'shadow.opacity', label: 'Shadow Opacity', type: PROPERTY_TYPES.number },
  { id: 'shadow.offsetX', label: 'Shadow X', type: PROPERTY_TYPES.number },
  { id: 'shadow.offsetY', label: 'Shadow Y', type: PROPERTY_TYPES.number },
  { id: 'shadow.blur', label: 'Shadow Blur', type: PROPERTY_TYPES.number },
  { id: 'charSpacing', label: 'Character Spacing', type: PROPERTY_TYPES.number },
  { id: 'lineHeight', label: 'Line Height', type: PROPERTY_TYPES.number },
  { id: 'rx', label: 'Corner Radius X', type: PROPERTY_TYPES.number },
  { id: 'ry', label: 'Corner Radius Y', type: PROPERTY_TYPES.number },
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
