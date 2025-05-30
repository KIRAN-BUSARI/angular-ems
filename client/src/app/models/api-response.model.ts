/**
 * Generic API response interface for standardized server responses
 */
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

