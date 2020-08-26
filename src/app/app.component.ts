import {Component} from '@angular/core';

import {Platform, ToastController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {Store} from '@ngxs/store';
import {GetUserByMail, SetToken, SetUser, UpdateUser} from './store/actions/app.action';
import {GetPatients, GetUsers} from './store/actions/users.action';
import {GetEvents} from './store/actions/events.action';
import {AppState} from './store/states/app.state';
import {UsersState} from './store/states/users.state';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {mergeMapTo} from 'rxjs/operators';
import {AngularFireFunctions} from '@angular/fire/functions';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    private menu = [
        {
            title: 'Inicio',
            url: '/home',
            icon: 'home',
            doctor: true,
            patient: true,
            show: true
        },
        {
            title: 'Agenda',
            url: '/calendar',
            icon: 'calendar',
            doctor: true,
            patient: true,
            show: true
        },
        {
            title: 'Usuarios',
            url: '/users',
            icon: 'people',
            doctor: true,
            patient: false,
            show: true
        },
        {
            title: 'Llamada',
            url: '/call',
            icon: 'videocam',
            doctor: true,
            patient: true,
            show: false
        },
        {
            title: 'Logout',
            url: '/logout',
            icon: 'log-out',
            doctor: true,
            patient: true,
            show: true,
            function: true
        }
    ];
    public appPages = [];
    user: any;

    constructor(
        private platform: Platform,
        public toastController: ToastController,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private router: Router,
        public afAuth: AngularFireAuth,
        private afMessaging: AngularFireMessaging,
        private store: Store
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.store.select(AppState.user).subscribe(user => {
                if (user) {
                    if (user['doctor']) {
                        this.appPages = this.menu.filter(m => m.doctor);
                    }
                    else {
                        this.appPages = this.menu.filter(m => m.patient);
                    }
                } else {
                    this.appPages = [];
                }
            });

            this.store.select(AppState.currentCall).subscribe(currentCall => {
                let show = false;
                if (currentCall) {
                    show = true;
                }

                this.appPages.forEach(menu => {
                    if (menu.title === 'Llamada') {
                        menu.show = show;
                    }
                });
            });

            this.afAuth.user.subscribe(user => {
                    if (user) {
                        this.initStore(user);
                        this.router.navigate(['/home']);
                    } else {
                        this.router.navigate(['/login']);
                    }
                }, err => {
                    this.router.navigate(['/login']);
                },
                () => {
                    this.splashScreen.hide();
                });

            this.afMessaging.requestToken
                .subscribe(
                    (token) => {
                        console.log(token, this.user, '****');
                        this.store.dispatch(new SetToken(token));
                        const interval = setInterval(() => {
                            console.log('this.user ', this.user);
                            if (this.user) {
                                clearInterval(interval);

                                if(this.user.token !== token) {
                                    const payload = Object.assign({}, this.user);
                                    payload.token = token;
                                    this.store.dispatch(new UpdateUser(payload));
                                }
                            }
                        }, 500);
                        },
                    (error) => { console.error(error); }
                );

            this.afMessaging.messages
                .subscribe((message) => {
                    this.presentToast(message);
                });
        });
    }

    async initStore(user) {
        this.store.dispatch(new GetUserByMail(user.email)).toPromise().then(() => {
            this.user = this.store.selectSnapshot(AppState.user);
        });

        this.store.dispatch(new GetUsers()).toPromise().then(() => {
            const users = this.store.selectSnapshot(UsersState.users);
            this.store.dispatch(new GetEvents(users));
        });

        this.store.dispatch(new GetPatients(user.uid));

    }

    callFunction(obj) {
        if (obj.title === 'Logout') {
            this.afAuth.auth.signOut()
                .then(() => {
                    this.router.navigate(['/login']);

                })
                .catch(err => console.log('Error logout ', err));
        }
    }

    async presentToast(message) {
        console.log('**** ', message);
        let notification;
        if (message.data) {
            notification = JSON.parse(message.data.notification);
        } else{
            notification = message.notification;
        }

        console.log('MESSAGE ', message, notification);
        const toast = await this.toastController.create({
            message: notification.body,
            duration: 2000
        });
        toast.present();
    }
}
