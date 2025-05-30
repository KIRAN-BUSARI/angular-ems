import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Employee } from '../models/employee.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8000/api/employees';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http
      .get<ApiResponse<Employee[]>>(this.apiUrl)
      .pipe(retry(3), catchError(this.handleError));
  }

  // Get a single employee by ID
  getEmployeeById(id: string): Observable<ApiResponse<Employee>> {
    return this.http
      .get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`)
      .pipe(retry(3), catchError(this.handleError));
  }

  // Create a new employee
  createEmployee(employee: Employee): Observable<ApiResponse<Employee>> {
    // Format data for API - ensure dateOfJoining is in ISO format if present
    const employeeData = {
      ...employee,
      dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString() : null
    };
    
    return this.http
      .post<ApiResponse<Employee>>(`${this.apiUrl}/create`, employeeData)
      .pipe(catchError(this.handleError));
  }

  // Update an employee
  updateEmployee(id: string, employee: Employee): Observable<ApiResponse<Employee>> {
    return this.http
      .put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, employee)
      .pipe(catchError(this.handleError));
  }

  // Delete an employee
  deleteEmployee(id: string): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
