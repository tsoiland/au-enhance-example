import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import {ConfirmBindingBehavior} from "./confirm-binding-behavior";
import {DtModal} from "./modal";

Aurelia
  .register(ConfirmBindingBehavior)
  .register(DtModal)
  .app(MyApp)
  .start();
