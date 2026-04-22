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
