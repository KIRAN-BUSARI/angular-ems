export interface Employee {
  _id?: string;
  name: string;
  position: string;
  department: string;
  experience: number;
  salary: number;
  dateOfJoining: string | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
