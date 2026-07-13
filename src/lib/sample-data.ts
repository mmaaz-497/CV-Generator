import { ACCENT_PALETTE } from "./constants";
import type { CVDocument } from "./cv-types";

/** Small, realistic CV used only to render live gallery thumbnails (plan R6). */
export const SAMPLE_CV: CVDocument = {
  personalInfo: {
    fullName: "Ayesha Khan",
    phone: "0300 1234567",
    email: "ayesha.khan@email.com",
    address: "12 Mall Road",
    city: "Lahore",
    dateOfBirth: "12 Apr 1996",
    cnic: "35201-1234567-8",
    maritalStatus: "Single",
    nationality: "Pakistani",
    religion: "Islam",
  },
  photo: null,
  sections: [
    {
      id: "objective",
      defaultHeading: "Career Objective",
      customHeading: null,
      content: {
        kind: "text",
        text: "Organised professional with 4+ years in retail sales and office administration, seeking a role to apply strong customer-service and record-keeping skills.",
      },
    },
    {
      id: "education",
      defaultHeading: "Education",
      customHeading: null,
      content: {
        kind: "entries",
        entries: [
          {
            id: "s-edu-1",
            title: "Bachelor of Commerce (B.Com)",
            subtitle: "University of the Punjab",
            period: "2014 – 2016",
            detail: "First Division",
          },
          {
            id: "s-edu-2",
            title: "Intermediate (I.Com)",
            subtitle: "Govt. College, Lahore",
            period: "2012 – 2014",
            detail: "A Grade",
          },
        ],
      },
    },
    {
      id: "experience",
      defaultHeading: "Work Experience",
      customHeading: null,
      content: {
        kind: "entries",
        entries: [
          {
            id: "s-exp-1",
            title: "Sales Associate",
            subtitle: "Al-Karam Store, Lahore",
            period: "2017 – 2021",
            detail: "Handled daily sales, inventory and customer queries.",
          },
        ],
      },
    },
    {
      id: "skills",
      defaultHeading: "Skills",
      customHeading: null,
      content: {
        kind: "skills",
        items: ["MS Office", "Customer Service", "Inventory", "Typing 45 wpm"],
      },
    },
    {
      id: "languages",
      defaultHeading: "Languages",
      customHeading: null,
      content: {
        kind: "entries",
        entries: [
          { id: "s-lng-1", title: "English", subtitle: "Fluent", period: "", detail: "" },
          { id: "s-lng-2", title: "Urdu", subtitle: "Native", period: "", detail: "" },
        ],
      },
    },
    {
      id: "certifications",
      defaultHeading: "Certifications & Courses",
      customHeading: null,
      content: {
        kind: "entries",
        entries: [
          {
            id: "s-crt-1",
            title: "Computer Applications",
            subtitle: "National College",
            period: "2016",
            detail: "",
          },
        ],
      },
    },
    {
      id: "references",
      defaultHeading: "References",
      customHeading: null,
      content: { kind: "references", onRequest: true, entries: [] },
    },
  ],
  style: {
    templateId: "classic",
    accentColor: ACCENT_PALETTE[0],
    fontSizeLevel: "medium",
  },
  screen: "gallery",
};
