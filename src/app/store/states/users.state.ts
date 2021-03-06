import {Action, Selector, State, StateContext, Store} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {
    AddUser,
    DeleteUser,
    GetPatients,
    GetUser,
    GetUsers,
    SwapConsultaValues,
    UpdateUserData,
    UsersStateModel
} from '../actions/users.action';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {tap} from 'rxjs/operators';
import {AppState} from './app.state';
import {UserModel} from '../../models/models';


@State<UsersStateModel>({
    name: 'users',
    defaults: {
        users: null,
        patients: null
    }
})
@Injectable()
export class UsersState {
    @Selector()
    static users(state: UsersStateModel): UserModel[] | object | null {
        return state.users;
    }

    @Selector()
    static patients(state: UsersStateModel): object | null {
        return state.patients;
    }

    constructor(private firebaseService: FirebaseService,
                private store: Store) {}

    @Action(GetUsers)
    getUsers(ctx: StateContext<UsersStateModel>) {
        return new Promise((resolve, reject) =>{
            this.firebaseService.getUsers()
                .subscribe( data => {
                    ctx.patchState({
                        users: data
                    });
                    resolve(data);
                }, error => reject(error));
        });
    }

    @Action(GetPatients)
    getPatients(ctx: StateContext<UsersStateModel>, payload: GetPatients) {
        return new Promise((resolve, reject) => {
            this.firebaseService.getPatients(payload.id)
                .subscribe( data => {
                    ctx.patchState({
                        patients: data
                    });
                    resolve(data);
                }, error => reject(error));
        });
    }

    @Action(GetUser)
    getUser(ctx: StateContext<UsersStateModel>, action: GetUser) {
        return this.firebaseService.getUser(action.id)
            .pipe(
                tap(data => {
                    console.log('DATA ', data);
                })
            );
    }

    @Action(AddUser)
    addUser(ctx: StateContext<UsersStateModel>, action: AddUser) {
        return this.firebaseService.createUser(action.payload)
            .then(data => {
                const users = Object.assign([], ctx.getState().users);
                const patients = Object.assign([], ctx.getState().patients);

                users.push(data);
                patients.push(data);

                ctx.patchState({
                    users,
                    patients
                });

            });
    }

    @Action(DeleteUser)
    deleteUser(ctx: StateContext<UsersStateModel>, action: DeleteUser) {
        return this.firebaseService.deleteUser(action.payload)
            .then(() => {
                const users = Object.assign([], ctx.getState().users).filter(u => u.id !== action.payload);
                const patients = Object.assign([], ctx.getState().patients).filter(u => u.id !== action.payload);

                ctx.patchState({
                    patients,
                    users
                });
            });
    }

    @Action(UpdateUserData)
    updateUser(ctx: StateContext<UsersStateModel>, action: UpdateUserData) {
        const users = Object.assign([], ctx.getState().users);
        const patients = Object.assign([], ctx.getState().patients);
        const userID = action.payload['id'];

        return this.firebaseService.updateUser(action.payload)
            .then(data => {
                const user = users.findIndex(u => u.id === userID);
                const patient = patients.findIndex(u => u.id === userID);

                if(!action.payload['id']){
                    action.payload['id'] = userID;
                }

                if(user !== -1) {
                    const tmp = Object.assign([], users);
                    tmp[user] = action.payload;
                    ctx.patchState({
                        users: tmp
                    });
                }

                if(patient !== -1){
                    const tmp = Object.assign([], patients);
                    tmp[patient] = action.payload;
                    ctx.patchState({
                        patients: tmp
                    });
                }
            });
    }

    @Action(SwapConsultaValues)
    swapConsultaValues(ctx: StateContext<UsersStateModel>, action: SwapConsultaValues) {
        console.log(action);
        const {idUser, indexFrom, indexTo, valueFrom, valueTo, field} = action;

        const users = Object.assign([], ctx.getState().users);
        const patients = Object.assign([], ctx.getState().patients);

        const userIndex = users.findIndex(u => u.id === idUser);
        const patientIndex = patients.findIndex(u => u.id === idUser);

        users[userIndex].consultas[indexFrom][field] = valueTo;
        patients[patientIndex].consultas[indexFrom][field] = valueTo;

        users[userIndex].consultas[indexTo][field] = valueFrom;
        patients[patientIndex].consultas[indexTo][field] = valueFrom;

        ctx.patchState({
            users,
            patients
        });
    }
}
