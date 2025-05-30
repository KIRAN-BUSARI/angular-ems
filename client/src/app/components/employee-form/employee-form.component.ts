import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { ApiResponse } from '../../models/api-response.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css'],
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId = '';
  loading = false;
  submitting = false;
  error = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.employeeId = id;
        this.loadEmployee(id);
      }
    });
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      position: ['', Validators.required],
      department: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0)]],
      dateOfJoining: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
    });
  }

  loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (response: ApiResponse<Employee>) => {
        if (response && response.success && response.data) {
          const employee = response.data;

          try {
            // Only try to format the date if it exists
            let formattedDate = '';
            if (employee.dateOfJoining) {
              const joinDate = new Date(employee.dateOfJoining);
              if (!isNaN(joinDate.getTime())) {
                formattedDate = joinDate.toISOString().split('T')[0];
              }
            }

            this.employeeForm.patchValue({
              ...employee,
              dateOfJoining: formattedDate,
            });
          } catch (e) {
            console.error('Error formatting employee data:', e);
            this.error = 'Error processing employee data.';
          }
        } else {
          this.error = response?.message || 'Failed to load employee data.';
          console.error('Invalid API response:', response);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err.error?.message ||
          'Failed to load employee data. Please try again.';
        this.loading = false;
        console.error(err);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  clearMessages(): void {
    this.error = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    this.clearMessages();
    if (this.employeeForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.employeeForm.controls).forEach((key) => {
        const control = this.employeeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    // Get form values
    const formValues = this.employeeForm.value;

    // Create employee data object with proper date handling
    const employeeData: Employee = {
      ...formValues,
      // Keep dateOfJoining as ISO string format which the API expects
      // If it exists, ensure it's in YYYY-MM-DD format
      dateOfJoining: formValues.dateOfJoining ? formValues.dateOfJoining : null,
    };

    if (this.isEditMode) {
      this.employeeService
        .updateEmployee(this.employeeId, employeeData)
        .subscribe({
          next: (response: ApiResponse<Employee>) => {
            this.submitting = false;
            if (response && response.success) {
              this.successMessage = 'Employee updated successfully!';
              // Navigate after a short delay to show the success message
              setTimeout(() => {
                this.router.navigate(['/employees']);
              }, 1500);
            } else {
              this.error = response?.message || 'Failed to update employee.';
              console.error('Invalid API response:', response);
            }
          },
          error: (err) => {
            this.error =
              err.error?.message ||
              'Failed to update employee. Please try again.';
            this.submitting = false;
            console.error(err);
          },
        });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: (response: ApiResponse<Employee>) => {
          this.submitting = false;
          if (response && response.success) {
            this.successMessage = 'New employee added successfully!';
            // Navigate after a short delay to show the success message
            setTimeout(() => {
              this.router.navigate(['/employees']);
            }, 1500);
          } else {
            this.error = response?.message || 'Failed to add employee.';
            console.error('Invalid API response:', response);
          }
        },
        error: (err) => {
          this.error =
            err.error?.message || 'Failed to add employee. Please try again.';
          this.submitting = false;
          console.error(err);
        },
      });
    }
  }
}
