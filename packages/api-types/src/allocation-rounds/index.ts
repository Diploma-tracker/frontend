export type AllocationRoundStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface AllocationRoundDTO {
  id: string;
  name: string;
  status: AllocationRoundStatus;
  created_by: string;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
}

export interface ListAllocationRoundsRequest extends Record<string, unknown> {
  page: number;
  page_size: number;
  status_filter?: "ALL" | AllocationRoundStatus;
}

export interface ListAllocationRoundsResponse {
  items: AllocationRoundDTO[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateAllocationRoundRequest {
  name: string;
  start_at: string;
  end_at: string;
}

export interface CreateAllocationRoundResponse {
  allocation_round_id: string;
  name: string;
  status: string;
}
