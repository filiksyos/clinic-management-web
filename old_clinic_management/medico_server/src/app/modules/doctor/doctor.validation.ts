import { z } from 'zod';

const create = z.object({
  body: z.object({
    adminId: z.string({
      required_error: "Admin ID is required!"
    }),
    firstName: z.string({
      required_error: "First name is required!"
    }),
    lastName: z.string({
      required_error: "Last name is required!"
    }),
  }),
});

const update = z.object({
  body: z.object({
    firstName: z.string({
      required_error: "First name is required!"
    }).optional(),
    lastName: z.string({
      required_error: "Last name is required!"
    }).optional(),
  }),
});

export const DoctorValidation = {
  create,
  update,
};
