import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { LevelOneComponent } from './level-one/level-one.component';

const routes: Routes = [
  {path: "mainMenu",component: MainMenuComponent},
  {path: "levelOne", component: LevelOneComponent},
  {path: "**", redirectTo:"mainMenu",pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
