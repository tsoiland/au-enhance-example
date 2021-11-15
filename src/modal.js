import { bindable, BindingMode, customElement, inject } from 'aurelia';
import Materialize from 'materialize-css'
import template from './modal.html';

@customElement({name: 'dt-modal', template: template})
@inject(Element)
export class DtModal {
  element;
  modalElement; // Bound by ref.

  @bindable() fixedFooter = false;
  @bindable() dismissible = true;
  @bindable({mode: BindingMode.toView}) isOpen = false; // toView = from custom element to 'call site'

  materializeModalInstance;

  constructor(element) {
    this.element = element;
  }

  attached() {
    if (this.fixedFooter) {
      this.modalElement.item(0).addClass('modal-fixed-footer');
    }
  }

  dispose() {
    if (this.materializeModalInstance) {
      this.materializeModalInstance.destroy();
    }
  }

  open() {
    if (!this.materializeModalInstance) {
      this.materializeModalInstance = Materialize.Modal.init(this.modalElement, {
          dismissible: this.dismissible,
          onOpenStart: this.onOpenStart.bind(this),
          onOpenEnd: this.onOpenEnd.bind(this),
          onCloseStart: this.onCloseStart.bind(this),
          onCloseEnd: this.onCloseEnd.bind(this),
      });
    }
    this.materializeModalInstance.open();
  }

  close() {
    this.materializeModalInstance.close();
  }

  onOpenStart() {
    // Trigger modal open event on the custom element
    let event = new CustomEvent('modal-open-start', {
      detail: {},
      bubbles: true
    });
    this.element.dispatchEvent(event);

    return event;
  }

  onOpenEnd() {
    // Trigger modal open event on the custom element
    let event = new CustomEvent('modal-open-end', {
      detail: {},
      bubbles: true
    });
    this.element.dispatchEvent(event);

    this.isOpen = true;
    return event;
  }

  onCloseStart() {
    // Trigger modal close event on the custom element
    let event = new CustomEvent('modal-close-start', {
      detail: {},
      bubbles: true
    });
    this.element.dispatchEvent(event);

    return event;
  }

  onCloseEnd() {
    // Trigger modal close event on the custom element
    let event = new CustomEvent('modal-close-end', {
      detail: {},
      bubbles: true
    });
    this.element.dispatchEvent(event);

    this.isOpen = false;
    return event;
  }
}
