import { z } from 'zod'
const THEME_TOKENS = ['paper','paper-deep','card','ink','ink-soft','rule','coral','coral-deep','coral-ink','coral-soft','slate-deep']
const hexColor = z.string().trim().regex(/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)
const palette = z.partialRecord(z.enum(THEME_TOKENS), hexColor).default({})
const themeSchema = z.object({
  light: palette, dark: palette,
  typeScale: z.number().min(0.85).max(1.2).default(1),
  radius: z.enum(['sharp','soft','round']).default('soft'),
  grain: z.number().min(0).max(0.12).default(0.035),
  heroLayout: z.enum(['stacked','split','portrait-left']).default('stacked'),
  darkMode: z.enum(['off','toggle','auto']).default('off'),
  sections: z.array(z.object({ key: z.string().trim().max(40), visible: z.boolean().default(true) })).max(40).default([]),
  updatedAt: z.number().int().default(0),
})
const d = themeSchema._def
console.log('root type:', d.typeName || d.type)
const shape = typeof d.shape === 'function' ? d.shape() : d.shape
console.log('keys:', Object.keys(shape))
const light = shape.light
console.log('light type:', light._def.typeName || light._def.type)
console.log('light innerType:', light._def.innerType && (light._def.innerType._def.typeName || light._def.innerType._def.type))
const inner = light._def.innerType
if (inner) {
  console.log('  keyType:', inner._def.keyType && (inner._def.keyType._def.typeName||inner._def.keyType._def.type))
  console.log('  valueType:', inner._def.valueType && (inner._def.valueType._def.typeName||inner._def.valueType._def.type))
  const kt = inner._def.keyType
  console.log('  keyType values:', kt && (kt._def.values || Object.keys(kt._def.entries||{})))
}
const st = shape.sections
console.log('sections type:', st._def.typeName||st._def.type, '-> inner:', st._def.innerType && (st._def.innerType._def.typeName||st._def.innerType._def.type))
const arr = st._def.innerType
console.log('  array .element?', !!arr._def.element, ' .type?', typeof arr._def.type, arr._def.element && (arr._def.element._def.typeName||arr._def.element._def.type))
const en = shape.radius
console.log('radius inner values:', en._def.innerType._def.values, 'entries keys:', Object.keys(en._def.innerType._def.entries||{}))
console.log('DEFAULT parse:', JSON.stringify(themeSchema.parse({})))
