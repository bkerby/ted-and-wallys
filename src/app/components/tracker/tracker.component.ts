import { Component, OnInit } from '@angular/core';
import { Milestone } from 'src/app/types/milestone';
import { Employee } from 'src/app/types/employee';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent implements OnInit {

  selectedEmployee: Employee = new Employee();
  addEmployeeFirstName: string;
  addEmployeeLastName: string;
  addMilestoneName: string;
  addMilestoneDescription: string;

  mockMilestones: Milestone[] = [];
  mockEmployees: Employee[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private afstore: AngularFirestore
  ) { }

  ngOnInit() {
    this.afstore.collection('milestones').valueChanges().subscribe((m) => {
      this.mockMilestones = m as Milestone[];
    });
    this.afstore.collection('employees').valueChanges().subscribe((e) => {
      this.mockEmployees = e as Employee[];
    });
  }

  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
  }

  hasCompletedMilestone(milestones: string[], milestoneId: string) {
    return milestones.indexOf(milestoneId) !== -1;
  }

  addMilestone() {
    if (!this.addMilestoneName && !this.addMilestoneDescription) {
      this.snackBar.open('Enter a name and discription', 'Dismiss', {
        duration: 3000
      });
      return;
    }
    const tempMilestoneId = this.afstore.createId();
    this.afstore.doc(`milestones/${tempMilestoneId}`).set({
      name: this.addMilestoneName,
      description: this.addMilestoneDescription,
      milestoneId: tempMilestoneId
    });
  }

  addEmployee() {
    if (!this.addEmployeeFirstName && !this.addEmployeeLastName) {
      this.snackBar.open('Enter a first and last name', 'Dismiss', {
        duration: 3000
      });
      return;
    }
    const tempEmployeeId = this.afstore.createId();
    this.afstore.doc(`employees/${tempEmployeeId}`).set({
      fName: this.addEmployeeFirstName,
      lName: this.addEmployeeLastName,
      milestones: [],
      employeeId: tempEmployeeId
    });
  }

  removeMilestone(tempMilestoneId: string) {
    this.afstore.doc(`milestones/${tempMilestoneId}`).delete();
  }

  removeEmployee(tempEmployeeId) {
    this.afstore.doc(`employees/${tempEmployeeId}`).delete();
  }

  updateMilestones(milestoneId: string, milestones: string[]) {
    if (milestones.indexOf(milestoneId) === -1) {
      console.log('Add');
      this.afstore.doc(`employees/${this.selectedEmployee.employeeId}`).update({
        milestones: firebase.firestore.FieldValue.arrayUnion(milestoneId)
      });
    } else {
      console.log('Remove');
      this.afstore.doc(`employees/${this.selectedEmployee.employeeId}`).update({
        milestones: firebase.firestore.FieldValue.arrayRemove(milestoneId)
      });
    }
  }
}
