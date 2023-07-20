const { z } = require('zod');

const signUpSchema = z.object({
  storeName: z
    .string()
    .min(3, 'minimum 3 characters required for store name')
    .max(32, 'maximum 32 characters accepted for store name'),
  image: z.string().optional(),
  storeDescription: z
    .string()
    .min(3, 'minimum 3 characters required for store description')
    .max(150, 'maximum 150 characters accepted for store description'),
  name: z
    .string()
    .min(3, 'minimum 3 characters required for name')
    .max(32, 'maximum 32 characters accepted for name'),
  email: z
    .string()
    .email('text is not of type email')
    .min(3, 'minimum 3 characters required for email')
    .max(50, 'maximum 50 characters accepted for email'),
  password: z
    .string()
    .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
    .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
    .regex(new RegExp('.*\\d.*'), 'One number')
    .regex(
      new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
      'One special character'
    )
    .min(8, 'Must be at least 8 characters in length for password')
    .max(50, 'maximum 32 characters accepted for password'),
});

const productGetSchema = z.object({
  categoryName: z
    .string()
    .min(3, 'category name must be at least 3 characters long')
    .max(50, 'category name must be at most 50 characters long')
    .optional(),
  search: z
    .string()
    .min(3, 'product name must be at least 3 characters long')
    .max(50, 'product name must be at most 50 characters long')
    .optional(),
  include: z.enum(['category']).optional(),
  all: z.enum(['true']).optional(),
});

const employeeSchema = z.object({
  name: z
    .string()
    .min(3, 'minimum 3 characters required for name')
    .max(32, 'maximum 32 characters accepted for name'),
  email: z
    .string()
    .email('text is not of type email')
    .min(3, 'minimum 3 characters required for email')
    .max(50, 'maximum 50 characters accepted for email'),
  password: z
    .string()
    .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
    .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
    .regex(new RegExp('.*\\d.*'), 'One number')
    .regex(
      new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
      'One special character'
    )
    .min(8, 'Must be at least 8 characters in length for password')
    .max(50, 'maximum 32 characters accepted for password'),
});

module.exports = {
  signUpSchema,
  productGetSchema,
  employeeSchema,
};
