import { z } from "zod";

export const createOrderSchema = z.object({
  restaurant: z.string().min(1, "Restaurant is required"),
  payerName: z.string().min(1, "Payer name is required"),
  currency: z.string().optional(),
  comments: z.string().optional(),
  deadlineAt: z.string().optional(),
  deliveryFee: z.number().min(0).optional(),
  tip: z.number().min(0).optional(),
  paymentBank: z.string().optional(),
  paymentHolder: z.string().optional(),
  paymentClabe: z.string().optional(),
  paymentCard: z.string().optional(),
});

export const updateOrderSchema = createOrderSchema.partial().extend({
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "ARCHIVED", "CANCELLED"]).optional(),
});

export const addParticipantSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  items: z.array(z.object({
    product: z.string().min(1, "Product is required"),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    notes: z.string().optional(),
  })).min(1, "At least one item required"),
});

export const updateItemSchema = z.object({
  product: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
