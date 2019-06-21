import { Component } from "@angular/core";
import { DataManager } from "../../providers/DataManager";

@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage{
    user;
    constructor(private dataMngr: DataManager){
        this.user = this.dataMngr.load('user-data'); 
    }


}