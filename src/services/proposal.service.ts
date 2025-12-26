import { http } from "./http";

export interface Proposal {
  _id: string;
  project: string | {
    _id: string;
    name?: string;
    title?: string;
    category?: string;
    location?: string;
  };
  engineer?: {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  description: string;
  estimatedTimeline?: string;
  relevantExperience?: string;
  proposedBudget: {
    amount: number;
    currency: string;
  };
  status: "pending" | "accepted" | "rejected" | "reviewed";
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProposalData {
  description: string;
  estimatedTimeline?: string;
  relevantExperience?: string;
  proposedBudget: {
    amount: number;
    currency: string;
  };
}

export interface UpdateProposalData extends Partial<CreateProposalData> {}

/**
 * Submit a proposal for a project
 * POST /api/proposals/project/:projectId
 */
export const submitProposal = async (projectId: string, data: CreateProposalData): Promise<Proposal> => {
  const response = await http.post(`/proposals/project/${projectId}`, data);
  return response.data?.data || response.data?.proposal || response.data;
};

/**
 * Get engineer's proposals
 * GET /api/proposals/my
 */
export const getMyProposals = async (): Promise<Proposal[]> => {
  const response = await http.get("/proposals/my");
  const data = response.data?.data || response.data?.proposals || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Get proposals for a specific project
 * GET /api/proposals/project/:projectId
 */
export const getProjectProposals = async (projectId: string): Promise<Proposal[]> => {
  const response = await http.get(`/proposals/project/${projectId}`);
  const data = response.data?.data || response.data?.proposals || response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Update a proposal
 * PUT /api/proposals/:id
 */
export const updateProposal = async (proposalId: string, data: UpdateProposalData): Promise<Proposal> => {
  const response = await http.put(`/proposals/${proposalId}`, data);
  return response.data?.data || response.data?.proposal || response.data;
};

/**
 * Delete a proposal
 * DELETE /api/proposals/:id
 */
export const deleteProposal = async (proposalId: string): Promise<void> => {
  await http.delete(`/proposals/${proposalId}`);
};

/**
 * Update proposal status (Admin only)
 * PUT /api/proposals/:id/status
 */
export const updateProposalStatus = async (
  proposalId: string,
  status: "accepted" | "rejected" | "reviewed"
): Promise<Proposal> => {
  const response = await http.put(`/proposals/${proposalId}/status`, { status });
  return response.data?.data || response.data?.proposal || response.data;
};


