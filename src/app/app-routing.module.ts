import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { LevelOneComponent } from './level-one/level-one.component';

const routes: Routes = [
  { path: 'mainMenu', component: MainMenuComponent },
  { path: 'levelOne', component: LevelOneComponent },
  // {path: "**", redirectTo:"mainMenu",pathMatch:'full'}
  { path: '**', redirectTo: 'levelOne', pathMatch: 'full' }, // Temporary change so that Level One is shown by default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
