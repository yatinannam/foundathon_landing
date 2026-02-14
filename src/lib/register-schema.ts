import { z } from "zod";

export const srmMemberSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  raNumber: z.string().trim().min(2, "RA Number is required."),
  collegeId: z.string().trim().min(2, "College ID Number is required."),
  dept: z.string().trim().min(2, "Department is required."),
  contact: z.string().trim().min(8, "Valid contact is required."),
});

export const nonSrmMemberSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  collegeId: z.string().trim().min(2, "College ID Number is required."),
  collegeEmail: z.string().trim().email("Valid college email is required."),
  contact: z.string().trim().min(8, "Valid contact is required."),
});

export const srmTeamSubmissionSchema = z.object({
  teamType: z.literal("srm"),
  teamName: z.string().trim().min(2, "Team Name is required."),
  lead: srmMemberSchema,
  members: z
    .array(srmMemberSchema)
    .min(2, "At least 2 members are required besides the lead.")
    .max(4, "Maximum 4 members are allowed besides the lead."),
});

export const nonSrmTeamSubmissionSchema = z
  .object({
    teamType: z.literal("non_srm"),
    teamName: z.string().trim().min(2, "Team Name is required."),
    collegeName: z.string().trim().min(2, "College Name is required."),
    isClub: z.boolean(),
    clubName: z.string().trim(),
    lead: nonSrmMemberSchema,
    members: z
      .array(nonSrmMemberSchema)
      .min(2, "At least 2 members are required besides the lead.")
      .max(4, "Maximum 4 members are allowed besides the lead."),
  })
  .superRefine((data, ctx) => {
    if (data.isClub && !data.clubName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["clubName"],
        message: "Club Name is required when this team represents a club.",
      });
    }
  });

export const teamSubmissionSchema = z.discriminatedUnion("teamType", [
  srmTeamSubmissionSchema,
  nonSrmTeamSubmissionSchema,
]);

export const teamRecordSchema = teamSubmissionSchema.and(
  z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
);

export const teamRecordListSchema = z.array(teamRecordSchema);

export type SrmMember = z.infer<typeof srmMemberSchema>;
export type NonSrmMember = z.infer<typeof nonSrmMemberSchema>;
export type TeamSubmission = z.infer<typeof teamSubmissionSchema>;
export type TeamRecord = z.infer<typeof teamRecordSchema>;
