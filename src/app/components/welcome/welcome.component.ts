import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  registerView = false;

  email = '';
  password = '';

  firstName = '';
  lastName = '';
  registerEmail = '';
  registerPassword = '';
  registerCPassword = '';

  constructor(private userService: UserService) { }

  ngOnInit() {
  }

  registerToggle() {
    this.registerView = !this.registerView;
  }

  register() {
    this.userService.register(this.firstName, this.lastName, this.registerEmail, this.registerPassword, this.registerCPassword);
  }

  login() {
    this.userService.login(this.email, this.password);
  }

}
