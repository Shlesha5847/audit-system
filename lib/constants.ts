export interface Firm {
  id: string;
  name: string;
}

export const FIRMS: Firm[] = [
  { id: "e23cd1ac-43ba-4cfb-b09a-ba8760fd7b36", name: "Firm A" },
  { id: "83478457-381c-42b9-b05d-fdc775e4ed9e", name: "Firm B" },
];

export interface User {
  id: string;
  name: string;
  role: "staff" | "reviewer";
  firm_id: string;
}

export const USERS: User[] = [
  {
    id: "e1e1ef1d-5a2a-433f-8894-0169ff46b9ca",
    name: "Rohit",
    role: "staff",
    firm_id: "83478457-381c-42b9-b05d-fdc775e4ed9e", // Firm B
  },
  {
    id: "99973873-79db-4f3e-b813-819cf5848a91",
    name: "Aman",
    role: "reviewer",
    firm_id: "83478457-381c-42b9-b05d-fdc775e4ed9e", // Firm B
  },
];

export const defaultFirm: Firm = FIRMS[1]; // Firm B
export const defaultUser: User = USERS[0]; // Rohit (Staff)
export const currentUser: User = USERS[0];

export interface Client {
  id: string;
  name: string;
  firm_id: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  client_id: string;
  firm_id: string;
  file_url: string;
  status: string;
  uploaded_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  document_id: string;
  firm_id: string;
  action: string;
  performed_by: string;
  comment: string;
  created_at: string;
}
