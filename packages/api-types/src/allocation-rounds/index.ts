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

export type TeacherSelectionFilter = "all" | "selected" | "not_selected";

export type SupervisionApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ApplicationDTO {
  id: string;
  student_id: string;
  status: SupervisionApplicationStatus;
  created_at: string;
  decided_at: string | null;
}

export interface TeacherDTO {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_selected: boolean;
  applications: ApplicationDTO[];
}

export interface ListTeachersRequest extends Record<string, unknown> {
  page: number;
  page_size: number;
  search?: string;
  selection_filter?: TeacherSelectionFilter;
}

export interface ListTeachersResponse {
  items: TeacherDTO[];
  total: number;
  page: number;
  page_size: number;
}

export interface AddTeacherRequest {
  teacher_id: string;
}
