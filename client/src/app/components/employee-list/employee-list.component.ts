import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  departments: string[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filterDepartment = '';
  selectedEmployee: Employee | null = null;
  employeeToDelete: Employee | null = null;

  // Sorting properties
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  // Notification properties
  notification: string = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    this.employees = [];
    this.filteredEmployees = [];

    this.employeeService.getEmployees().subscribe({
      next: (response: ApiResponse<Employee[]>) => {
        try {
          if (response && response.success && response.data) {
            const employeesData = response.data;

            if (Array.isArray(employeesData)) {
              this.employees = employeesData
                .filter((emp) => emp !== null && emp !== undefined)
                .map((emp) => ({
                  _id: emp._id || '',
                  name: emp.name || '',
                  position: emp.position || '',
                  department: emp.department || '',
                  experience: emp.experience || 0,
                  dateOfJoining: emp.dateOfJoining || null,
                  salary: emp.salary || 0,
                  createdAt: emp.createdAt,
                  updatedAt: emp.updatedAt,
                  __v: emp.__v,
                }));
            } else {
              console.warn('API response.data is not an array:', response.data);
              this.employees = [];
              this.error = 'Received invalid data format from server.';
            }
          } else {
            console.warn(
              'API response does not have expected structure:',
              response
            );
            this.employees = [];
            this.error =
              response?.message || 'Received invalid response from server.';
          }

          this.filteredEmployees = [...this.employees];
          this.applyPagination();
          this.extractDepartments();
          this.showNotification('Employees loaded successfully', 'success');
        } catch (e) {
          console.error('Error processing employee data:', e);
          this.error = 'Error processing employee data.';
          this.employees = [];
          this.filteredEmployees = [];
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Failed to load employees. Please try again.';
        }
        this.loading = false;
        console.error('API error:', err);
        this.showNotification('Failed to load employees', 'error');
      },
    });
  }

  extractDepartments(): void {
    const departmentsSet = new Set<string>();
    if (this.employees && this.employees.length > 0) {
      this.employees.forEach((emp) => {
        if (emp && emp.department) {
          departmentsSet.add(emp.department);
        }
      });
    }
    this.departments = Array.from(departmentsSet).sort();
  }

  filterEmployees(): void {
    if (!this.employees || this.employees.length === 0) {
      this.filteredEmployees = [];
      this.paginatedEmployees = [];
      return;
    }

    this.filteredEmployees = this.employees.filter((emp) => {
      if (!emp) return false;

      const matchesSearch =
        this.searchTerm === '' ||
        (emp.name &&
          emp.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (emp.position &&
          emp.position.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (emp.department &&
          emp.department.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesDepartment =
        this.filterDepartment === '' ||
        emp.department === this.filterDepartment;

      return matchesSearch && matchesDepartment;
    });

    this.currentPage = 1;

    if (this.sortColumn) {
      this.applySorting();
    }

    this.applyPagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterEmployees();
  }

  clearDepartmentFilter(): void {
    this.filterDepartment = '';
    this.filterEmployees();
  }

  sortTable(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.applyPagination();
  }

  applySorting(): void {
    if (!this.sortColumn) return;

    this.filteredEmployees.sort((a, b) => {
      let comparison = 0;

      if (this.sortColumn === 'experience') {
        comparison = a.experience - b.experience;
      } else if (this.sortColumn === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortColumn === 'position') {
        comparison = a.position.localeCompare(b.position);
      } else if (this.sortColumn === 'department') {
        comparison = a.department.localeCompare(b.department);
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);

    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages)
      this.currentPage = this.totalPages || 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;

    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 2; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  getExperiencePercentage(employee: Employee): number {
    const maxExperience = Math.max(...this.employees.map((e) => e.experience));
    return Math.min(100, (employee.experience / maxExperience) * 100);
  }

  getDepartmentCount(): number {
    return this.departments ? this.departments.length : 0;
  }

  getAverageExperience(): number {
    if (!this.employees || this.employees.length === 0) return 0;
    const total = this.employees.reduce((sum, emp) => sum + emp.experience, 0);
    return total / this.employees.length;
  }

  viewEmployeeDetails(employee: Employee): void {
    this.selectedEmployee = employee;
  }

  closeModal(): void {
    this.selectedEmployee = null;
  }

  confirmDelete(employee: Employee): void {
    this.employeeToDelete = employee;
  }

  cancelDelete(): void {
    this.employeeToDelete = null;
  }

  deleteEmployee(): void {
    if (!this.employeeToDelete || !this.employeeToDelete._id) return;

    this.employeeService.deleteEmployee(this.employeeToDelete._id).subscribe({
      next: () => {
        const deletedName = this.employeeToDelete?.name;
        this.employees = this.employees.filter(
          (e) => e._id !== this.employeeToDelete?._id
        );
        this.filteredEmployees = this.filteredEmployees.filter(
          (e) => e._id !== this.employeeToDelete?._id
        );
        this.employeeToDelete = null;

        this.extractDepartments();
        this.applyPagination();
        this.showNotification(
          `${deletedName} has been deleted successfully`,
          'success'
        );
      },
      error: (err) => {
        console.error('Error deleting employee:', err);
        this.error = 'Failed to delete employee. Please try again.';
        this.showNotification('Failed to delete employee', 'error');
      },
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = message;
    this.notificationType = type;

    setTimeout(() => {
      this.clearNotification();
    }, 3000);
  }

  clearNotification(): void {
    this.notification = '';
  }
}
