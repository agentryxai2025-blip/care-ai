export interface CaregiverRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  participantIds: string[];
}

export const CAREGIVERS: CaregiverRecord[] = [
  {
    id: "cg-1",
    name: "Maria Lopez",
    email: "maria@agentryx.care",
    passwordHash: "$2b$10$tspevotyNRx1/4XsK3PgCu/0aZqydq0BtUUpB9HUgvcm6eHRImcdW",
    role: "caregiver",
    participantIds: ["1", "4", "7"],
  },
  {
    id: "cg-2",
    name: "Sarah Kim",
    email: "sarah@agentryx.care",
    passwordHash: "$2b$10$tspevotyNRx1/4XsK3PgCu/0aZqydq0BtUUpB9HUgvcm6eHRImcdW",
    role: "caregiver",
    participantIds: ["2", "5", "8"],
  },
  {
    id: "cg-3",
    name: "Tom Harris",
    email: "tom@agentryx.care",
    passwordHash: "$2b$10$tspevotyNRx1/4XsK3PgCu/0aZqydq0BtUUpB9HUgvcm6eHRImcdW",
    role: "caregiver",
    participantIds: ["3", "6"],
  },
  {
    id: "cg-admin",
    name: "Admin",
    email: "admin@agentryx.care",
    passwordHash: "$2b$10$aSRbHKQiYU0hnvb7LgnmzePeEjE53aJGThCnYBpVb/DELSdAl7Nkq",
    role: "admin",
    participantIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
  },
];
