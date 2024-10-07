import { z } from 'zod';

/**
 * @link https://github.com/chavyleung/scripts/blob/master/box/chavy.boxjs.html#L1019
 */
export const boxJsTypeSchema = z.enum([
  'text',
  'slider',
  'boolean',
  'textarea',
  'radios',
  'checkboxes',
  'colorpicker',
  'number',
  'selects',
  'modalSelects',
]);

export type BoxJsType = z.infer<typeof boxJsTypeSchema>;

/**
 * @link https://nsloon.app/docs/Plugin/#argumentbuild-733
 */
export const loonTypeSchema = z.enum(['input', 'select', 'switch']);
export type LoonType = z.infer<typeof loonTypeSchema>;

export const argumentTypeSchema = z.enum(['string', 'number', 'boolean', 'array']);
export type ArgumentType = z.infer<typeof argumentTypeSchema>;

export const argumentItemSchema = z.object({
  key: z.string().describe('参数 key'),
  type: argumentTypeSchema.describe('参数类型'),
  boxJsType: boxJsTypeSchema.optional().describe('自动的映射关系无法满足时，可以使用 boxJsType 来自定义'),
  name: z.string().optional().describe('参数描述'),
  description: z.string().optional().describe('参数简介'),
  defaultValue: z.any().optional().describe('默认值'),
  options: z
    .array(
      z.object({
        key: z.string(),
        label: z.string().optional(),
      }),
    )
    .optional()
    .describe('选项'),
  placeholder: z.string().optional().describe('输入框占位符'),
  exclude: z
    .array(z.enum(['surge', 'loon', 'boxjs', 'dts']))
    .optional()
    .describe('当前参数在哪些平台上不生效'),
});

export type ArgumentItem = z.infer<typeof argumentItemSchema>;

export const argumentsBuilderOptionsSchema = z.object({
  args: z.array(argumentItemSchema).optional(),
});

export type ArgumentsBuilderOptions = z.infer<typeof argumentsBuilderOptionsSchema>;
