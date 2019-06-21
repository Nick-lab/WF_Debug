import { Component, ViewChild } from '@angular/core';
import { Platform, Events, Nav, App, ModalController } from 'ionic-angular';
import { ElectronProvider } from '../providers/electron/electron';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { HomePage } from '../pages/home/home';
import { AccountPage } from '../pages/account/account';
@Component({
  templateUrl: 'app.html',
  animations: [
    trigger('back-button', [
      state('true', style({
        left: '0px'
      })),
      state('false', style({
        left: '-50px'
      })),
      transition('true => false', animate('100ms ease-in')),
      transition('false => true', animate('100ms ease-out'))
    ]),
    trigger('title', [
      state('true', style({
        left: '0px'
      })),
      state('false', style({
        left: '-50px'
      })),
      transition('true => false', animate('100ms ease-in')),
      transition('false => true', animate('100ms ease-out'))
    ])
  ]
})
export class MyApp {
  fullscreen = this.electron.isFullScreen();
  title = "App";
  titleHold = false;
  hasControls = {
    full: true,
    back: false
  };
  modals = [];
  @ViewChild('Nav') nav: Nav;
  accountPage: any = false;
  rootPage: any = HomePage;

  constructor(
    platform: Platform,
    public electron: ElectronProvider,
    public events: Events,
    public app: App,
    private modalCtrl: ModalController
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      this.nav.setRoot(HomePage).then(() => {
        this.hasControls.back = false;
      });
//      this.auth.auth.onAuthStateChanged((user) => {
//        if (user) {
//          
//        } else {
//          this.nav.setRoot(SignInPage).then(() => {
//            this.hasControls.back = false;
//          });
//        }
//      });

      this.nav.viewDidEnter.subscribe(() => {
        let activeNav = app.getActiveNav();
        if (activeNav.canGoBack()) {
          this.hasControls.back = true;
        } else {
          this.hasControls.back = false;
        }
      });

    });

    events.subscribe('window:title', (data) => {
      console.log('set title', this.titleHold);
      if (this.titleHold) {
        this.titleHold = false;
      } else {
        this.setTitle(data.title);
      }
    });

    events.subscribe('modal', (modal) => {
      this.modals.push(modal);
      this.hasControls.back = true;
    });
    events.subscribe('close-modal', (id = false) => {
      if (id) {
        for (let index = 0; index < this.modals.length; index++) {
          if (this.modals[index].id == id) {
            if (this.modals.length - 2 >= 0) {
              if (typeof this.modals[this.modals.length - 1].title != undefined) {
                console.log(this.modals[this.modals.length - 1].title);
                this.title = this.modals[this.modals.length - 1].title;
                this.titleHold = true;
              }
            }
            this.modals.splice(index, 1);
          }
        }
      } else {
        let ind = this.modals.length - 1;
        if (this.modals.length - 2 >= 0) {
          if (typeof this.modals[this.modals.length - 1].title != undefined) {
            console.log(this.modals[this.modals.length - 1].title);
            this.title = this.modals[this.modals.length - 1].title;
            this.titleHold = true;
          }
        }
        this.modals.splice(ind, 1);
      }
    });

    document.title = this.title;
  }

  setTitle(title) {
    this.title = document.title = title;
  }

  onBack() {
    if (this.modals.length >= 1) {
      let ind = this.modals.length - 1;
      this.modals[ind].modal.dismiss();
      this.modals[ind].clearVar ? this[this.modals[ind].clearVar] = false : null;
      if (this.modals.length - 2 >= 0) {
        if (typeof this.modals[this.modals.length - 1].title != undefined) {
          console.log(this.modals[this.modals.length - 1].title);
          this.title = this.modals[this.modals.length - 1].title;
          this.titleHold = true;
        }
      }
      this.modals.splice(ind, 1);
    } else {
      this.nav.pop().then(() => {
        this.checkBack();
      });
    }
    this.checkBack();
  }

  checkBack() {
    let activeNav = this.app.getActiveNav();
    if (activeNav.canGoBack()) {
      this.hasControls.back = true;
    } else {
      this.hasControls.back = false;
    }
  }

  onAccount() {
    if(this.accountPage){
      this.onBack();
      this.accountPage = false;
      this.checkBack();
    }else{
      this.accountPage = this.modalCtrl.create(AccountPage);
      this.modals.push({modal: this.accountPage, title: 'Account', clearVar: 'accountPage'});
      this.accountPage.present();
      this.hasControls.back = true;
    }
    
  }
  onMin() {
    this.electron.minimizeWindow();
  }
  onMax() {
    this.fullscreen = this.electron.maximizeWindow();
  }
  onClose() {
    this.electron.closeWindow();
  }



}

