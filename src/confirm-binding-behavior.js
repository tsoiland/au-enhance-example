import Aurelia, {bindingBehavior, inject, LifecycleFlags} from 'aurelia';
import {IAurelia, BindingInterceptor } from '@aurelia/runtime-html';

@bindingBehavior('confirm')
@inject(IAurelia)
export class ConfirmBindingBehavior extends BindingInterceptor {
  aurelia;

  constructor(aurelia, binding, expression) {
    super(binding, expression);
    this.aurelia = aurelia;
  }

  callSource(event) {
    let innerFunction = () => super.callSource(event);
    let title = this.expr.args[0]?.value || '';
    let innerHtml = this.expr.args[1]?.value || '';
    let withSurroundingDiv = this.expr.args[2]?.value || false;
    let useStaticAurelia = this.expr.args[3]?.value || false;
    return ConfirmBindingBehavior.createAndOpenModal(innerFunction, this.aurelia, title, innerHtml, event, withSurroundingDiv, useStaticAurelia);
  }

  static createAndOpenModal(innerFunction, aurelia, title, innerHTML, event, withSurroundingDiv, useStaticAurelia) {
    if (event) {
      event.preventDefault();
    }

    // Create modal
    let surroundingDiv = document.createElement('div');

    let modalElement = document.createElement('dt-modal');
    modalElement.setAttribute('view-model.ref', 'dtModalViewModel');
    modalElement.innerHTML = `<div au-slot><h3>${title}</h3>${innerHTML}</div>`;
    surroundingDiv.appendChild(modalElement);

    // Add footer to modal
    let footerElement = document.createElement('div');
    footerElement.setAttribute('au-slot', 'footer');

    // Add ok button
    let okButton = document.createElement('button');
    okButton.setAttribute('click.delegate', 'ok()');
    okButton.innerText = 'OK';
    footerElement.appendChild(okButton);
    modalElement.appendChild(footerElement);

    // Add ok button
    let cancelButton = document.createElement('button');
    cancelButton.setAttribute('click.delegate', 'cancel()');
    cancelButton.innerText = 'Cancel';
    footerElement.appendChild(cancelButton);
    modalElement.appendChild(footerElement);

    // Add modal to DOM
    let outerElement = withSurroundingDiv ? surroundingDiv : modalElement;

    document.body.appendChild(outerElement)

    // Return a promise that resolves when the inner function's return value resolves.
    return new Promise(resolve => {
      // Create view model
      let component = {
        dtModalViewModel: null,
        ok: null,
        cancel: null
      };

      // Enhance aurelia template of modal element
      let controller = useStaticAurelia
                          ? Aurelia.enhance({host: outerElement, component: component})
                          : aurelia.enhance({host: outerElement, component: component});

      let okButtonClicked = false;

      // Add okButton event handler that is dependent on view
      component.ok = () => {
        okButtonClicked = true;

        // Clean up modal
        component.dtModalViewModel.close();

        // Call inner function
        innerFunction(event)
          .finally(() => resolve());
      }

      // Add cancelButton event handler that is dependent on view
      component.cancel = () => component.dtModalViewModel.close()

      // Resolve promise when modal is closed. Except if ok button was clicked, in which case promise should not resolved until inner function is completed.
      modalElement.addEventListener('modal-close-start', evt => {
        if (!okButtonClicked) {
          resolve();
        }
      });
      modalElement.addEventListener('modal-close-end', evt => {
        // Clean up modal
        controller.deactivate(controller, null, LifecycleFlags.none);
        controller.dispose();
        document.body.removeChild(outerElement);
      });

      // Open modal
      component.dtModalViewModel.open();
    });
  }
}