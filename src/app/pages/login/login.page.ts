import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController} from '@ionic/angular';
import {AuthService} from '../../services/auth/auth.service';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  validations_form: FormGroup;
  errorMessage = '';

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email es obligatorio.' },
      { type: 'pattern', message: 'Favor de poner un email válido.' }
    ],
    'password': [
      { type: 'required', message: 'Contraseña es obligatorio.' },
      { type: 'minlength', message: 'La contraseña debe tener al menos 5 carácteres.' }
    ]
  };

  constructor(private alertController: AlertController,
              public afAuth: AngularFireAuth,
              private formBuilder: FormBuilder,
              private router: Router) {
  }

  ngOnInit() {
    console.log('INIT login --- ');
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])),
      password: new FormControl('', Validators.compose([Validators.minLength(5), Validators.required])),
    });
  }

  tryLogin(value){
    this.afAuth.auth.signInWithEmailAndPassword(value.email, value.password)
        .then(res => {
          this.router.navigate(['/home']);
        }, err => {
          this.errorMessage = err.message;
          console.log(err);
        });
  }

  goRegisterPage(){
    this.router.navigate(['/register']);
  }

  setNewPassword(){
    /*
    this.authService.doChangePassword()
        .then(() => this.presentAlert('Cambio de contraseña', 'Favor de revisar tu correo electrónico.'))
        .catch(err => this.presentAlert('Error de cambio de contraseña', err));

     */
  }

  async presentAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

}