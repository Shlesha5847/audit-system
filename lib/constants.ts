export const currentUser = {
  id: "99973873-79db-4f3e-b813-819cf5848a91", // Aman's actual user UUID in users table
  name: "Aman",
  role: "reviewer",
  firm_id: "83478457-381c-42b9-b05d-fdc775e4ed9e", // Firm B
};

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
