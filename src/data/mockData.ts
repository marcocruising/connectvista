import { Company, Conversation, Individual, Tag } from "@/types/crm";

// Tags
export const tags: Tag[] = [
  { id: "1", name: "Customer", color: "#3B82F6", category: "Company", created_at: "2023-01-01T00:00:00Z", created_by: "system" },
  { id: "2", name: "Investor", color: "#8B5CF6", category: "Company", created_at: "2023-01-01T00:00:00Z", created_by: "system" },
  { id: "3", name: "Advisor", color: "#10B981", category: "Individual", created_at: "2023-01-01T00:00:00Z", created_by: "system" },
  { id: "4", name: "Potential Employee", color: "#F59E0B", category: "Individual", created_at: "2023-01-01T00:00:00Z", created_by: "system" },
  { id: "5", name: "Partner", color: "#EC4899", category: "Company", created_at: "2023-01-01T00:00:00Z", created_by: "system" },
  { id: "6", name: "Competitor", color: "#EF4444", category: "Company", created_at: "2023-01-01T00:00:00Z", created_by: "system" },
  { id: "7", name: "VIP", color: "#6366F1", category: "All", created_at: "2023-01-01T00:00:00Z", created_by: "system" }
];

// Companies
export const companies: Company[] = [
  {
    id: "1",
    name: "Acme Corporation",
    industry: "Technology",
    website: "https://acme.example.com",
    created_at: "2023-01-15T08:30:00Z",
    updated_at: "2023-05-20T14:45:00Z",
    created_by: "system"
  },
  {
    id: "2",
    name: "Globex Industries",
    industry: "Manufacturing",
    website: "https://globex.example.com",
    created_at: "2023-02-10T10:15:00Z",
    updated_at: "2023-06-05T09:30:00Z",
    created_by: "system"
  },
  {
    id: "3",
    name: "Initech",
    industry: "Finance",
    website: "https://initech.example.com",
    created_at: "2023-03-22T15:45:00Z",
    updated_at: "2023-07-12T11:20:00Z",
    created_by: "system"
  },
  {
    id: "4",
    name: "Umbrella Corp",
    industry: "Healthcare",
    website: "https://umbrella.example.com",
    created_at: "2023-04-05T09:00:00Z",
    updated_at: "2023-08-18T16:30:00Z",
    created_by: "system"
  }
];

// Individuals
export const individuals: Individual[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@acme.example.com",
    phone: "+1 (555) 123-4567",
    role: "CTO",
    company_id: "1",
    tags: [tags[0], tags[2]],
    description: "Technical decision maker",
    created_at: "2023-01-20T09:30:00Z",
    updated_at: "2023-05-25T15:45:00Z",
    created_by: "system"
  },
  {
    id: "2",
    first_name: "Emily",
    last_name: "Johnson",
    email: "emily.johnson@globex.example.com",
    phone: "+1 (555) 234-5678",
    role: "CEO",
    company_id: "2",
    tags: [tags[1], tags[6]],
    description: "Key stakeholder for partnership",
    created_at: "2023-02-15T11:15:00Z",
    updated_at: "2023-06-10T10:30:00Z",
    created_by: "system"
  },
  {
    id: "3",
    first_name: "Michael",
    last_name: "Williams",
    email: "michael.williams@initech.example.com",
    phone: "+1 (555) 345-6789",
    role: "Investment Director",
    company_id: "3",
    tags: [tags[1]],
    description: "Primary contact for investment discussions",
    created_at: "2023-03-27T16:45:00Z",
    updated_at: "2023-07-17T12:20:00Z",
    created_by: "system"
  },
  {
    id: "4",
    first_name: "Sarah",
    last_name: "Davis",
    email: "sarah.davis@umbrella.example.com",
    phone: "+1 (555) 456-7890",
    role: "Director of Innovation",
    company_id: "4",
    tags: [tags[0], tags[4]],
    description: "Interested in our API integration",
    created_at: "2023-04-10T10:00:00Z",
    updated_at: "2023-08-23T17:30:00Z",
    created_by: "system"
  },
  {
    id: "5",
    first_name: "Robert",
    last_name: "Brown",
    email: "robert.brown@gmail.com",
    phone: "+1 (555) 567-8901",
    role: "Software Engineer",
    company_id: null,
    tags: [tags[3]],
    description: "Potential hire for backend engineering",
    created_at: "2023-05-05T14:30:00Z",
    updated_at: "2023-09-12T13:15:00Z",
    created_by: "system"
  }
];

// Conversations
export const conversations: Conversation[] = [
  {
    id: "1",
    title: "Initial Product Demo",
    date: "2023-05-10T13:00:00Z",
    summary: "Presented our product roadmap to Acme. They showed particular interest in our analytics features.",
    individualIds: ["1"],
    companyId: "1",
    nextSteps: "Send technical specs by Friday",
    created_at: "2023-05-10T15:30:00Z",
    updated_at: "2023-05-10T15:30:00Z",
    created_by: "system"
  },
  {
    id: "2",
    title: "Series B Funding Discussion",
    date: "2023-06-15T10:00:00Z",
    summary: "Met with Michael to discuss potential Series B funding. They need more user growth metrics.",
    individualIds: ["3"],
    companyId: "3",
    nextSteps: "Prepare detailed growth projections for next meeting",
    created_at: "2023-06-15T12:30:00Z",
    updated_at: "2023-06-15T12:30:00Z",
    created_by: "system"
  },
  {
    id: "3",
    title: "Partnership Strategy Call",
    date: "2023-07-20T14:30:00Z",
    summary: "Discussed potential manufacturing partnership with Globex. They can provide hardware at competitive rates.",
    individualIds: ["2"],
    companyId: "2",
    nextSteps: "Draft partnership agreement",
    created_at: "2023-07-20T16:45:00Z",
    updated_at: "2023-07-20T16:45:00Z",
    created_by: "system"
  },
  {
    id: "4",
    title: "Integration Requirements",
    date: "2023-08-25T11:00:00Z",
    summary: "Sarah outlined their API requirements. Our current solution needs some adaptations.",
    individualIds: ["4"],
    companyId: "4",
    nextSteps: "Technical group to assess integration effort",
    created_at: "2023-08-25T13:15:00Z",
    updated_at: "2023-08-25T13:15:00Z",
    created_by: "system"
  },
  {
    id: "5",
    title: "Technical Interview",
    date: "2023-09-05T09:30:00Z",
    summary: "Conducted technical interview with Robert. Strong algorithmic skills, good culture fit.",
    individualIds: ["5"],
    companyId: null,
    nextSteps: "Schedule second interview with lead engineer",
    created_at: "2023-09-05T11:45:00Z",
    updated_at: "2023-09-05T11:45:00Z",
    created_by: "system"
  }
];
