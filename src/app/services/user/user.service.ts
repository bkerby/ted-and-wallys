import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { first } from 'rxjs/operators';
import { auth } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/types/user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class UserService {
  user: User = new User();
  sub: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afstore: AngularFirestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  async register(firstName, lastName, email, password, cpassword) {
    if (password !== cpassword) {
      this.snackBar.open('Passwords don\'t match', 'Dismiss', {
        duration: 3000
      });
      return console.dir('Passwords don\'t match');
    }
    try {
      const res = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);

      this.user.email = res.user.email;
      this.user.fName = firstName;
      this.user.lName = lastName;

      this.afstore.doc(`users/${res.user.uid}`).set(Object.assign({}, this.user));
      this.setUser(this.user);
      this.router.navigate(['/tracker']);
    } catch (err) {
      console.dir(err);
      this.snackBar.open(err.message, 'Dismiss', {
        duration: 3000
      });
    }
  }

  async login(email, password) {
    try {
      const res = await this.afAuth.auth.signInWithEmailAndPassword(email, password);
      this.sub = this.afstore.doc(`users/${res.user.uid}`).valueChanges().subscribe(user => {
        this.setUser(user as User);
      });
      this.router.navigate(['/tracker']);
    } catch (err) {
      console.dir(err);
      this.snackBar.open(err.message, 'Dismiss', {
        duration: 3000
      });
    }
  }

  setUser(tempuser: User) {
    this.user = tempuser;
  }

  updateUser() {
    this.afstore.doc(`users/${this.afAuth.auth.currentUser.uid}`).update(Object.assign({}, this.user));
  }

  getUsername(): string {
    return this.user.email;
  }

  async reAuth(email: string, password: string) {
    try {
      await this.afAuth.auth.currentUser.reauthenticateWithCredential(auth.EmailAuthProvider.credential(email, password));
    } catch (err) {
      console.dir(err);
      this.snackBar.open(err.message, 'Dismiss', {
        duration: 3000
      });
    }
  }

  async updatePassword(newpassword: string) {
    try {
      await this.afAuth.auth.currentUser.updatePassword(newpassword);
    } catch (err) {
      console.dir(err);
      this.snackBar.open(err.message, 'Dismiss', {
        duration: 3000
      });
    }
  }

  async updateEmail(newemail: string) {
    try {
      await this.afAuth.auth.currentUser.updateEmail(newemail);
    } catch (err) {
      console.dir(err);
      this.snackBar.open(err.message, 'Dismiss', {
        duration: 3000
      });
    }
  }

  async isAuthenticated() {
    if (this.user) { return true; }

    this.user = new User();
    const tempuser = await this.afAuth.authState.pipe(first()).toPromise();

    if (tempuser) {
      this.sub = this.afstore.doc(`users/${this.afAuth.auth.currentUser.uid}`).valueChanges().subscribe(user => {
        this.user = user as User;
        this.setUser(this.user);
      });

      return true;
    }
    return false;
  }

  getUser(): User {
    return this.user;
  }

  async initUser() {
    await this.afstore.doc(`users/${this.afAuth.auth.currentUser.uid}`).valueChanges().subscribe(user => {
      this.setUser(user as User);
    });
  }

  async logout() {
    this.setUser(new User());
    try {
      await this.afAuth.auth.signOut();
      this.router.navigate(['/welcome']);
    } catch (e) {
      console.dir(e);
      this.snackBar.open(e.message, 'Dismiss', {
        duration: 3000
      });
    }
  }

}
