import { FormSubmission } from "./form_submission"

/**
 * This class is intented to handle URL updates after a form submits,
 * under certain circumstances.
 * It is initialized in Session and its updateUrl method is called from
 * FrameController class, when a form submission has been intercepted.
 */
export class FormUrlUpdater {
  formsHandlingPopstate: Array<HTMLFormElement> = []
  started = false

  start() {
    if (!this.started) {
      addEventListener("popstate", this.onPopState, false)
      this.started = true
    }    
  }

  stop() {
    if (this.started) {
      removeEventListener("popstate", this.onPopState, false)
      this.formsHandlingPopstate = []
      this.started = false
    }
  }

  updateUrl(formSubmission: FormSubmission) {
    const { formElement } = formSubmission
    if (formElement) {
      if (this.shouldUpdateURL(formElement)) {
        this.registerFormElement(formElement)
        const searchParams = formSubmission.body
        const newUrl = this.getNewUrl(formElement, searchParams)
        history.pushState({ searchParams: searchParams.toString() }, '', newUrl)
      }
      delete formElement.submittedByTurboFormUrlUpdater
    }
  }

  // Private

  // URL update

  private shouldUpdateURL(form: HTMLFormElement) {
    return !form.submittedByTurboFormUrlUpdater && form.dataset.turboUrlBase
  }

  private getBaseUrl(form: HTMLFormElement) {
    switch (form.dataset.turboUrlBase) {
      case "_form":
        return form.action
      case "_current":
        return window.location.href.split("?")[0].replace(/\/$/, "")
      default:
        return form.dataset.turboUrlBase
    }
  }

  private getNewUrl(form: HTMLFormElement, searchParams: FormData) {
    const baseUrl = this.getBaseUrl(form)
    return `${baseUrl}?${this.getMergedParams(searchParams)}`;
  }

  private getMergedParams(searchParams: FormData) {
    const currentSearchParams = new URLSearchParams(location.search);
    for (let pair of searchParams.entries()) {
      const key = pair[0];
      const value = pair[1].toString();
      if (currentSearchParams.has(pair[0])) {
        currentSearchParams.set(key, value);
      } else {
        currentSearchParams.append(key, value);
      }
    }
    return currentSearchParams;
  }

  // PopState handling

  private registerFormElement(form: HTMLFormElement) {
    if (this.shouldHandlePopstate(form) && !this.formsHandlingPopstate.includes(form)) {
      this.formsHandlingPopstate.push(form)
    }
  }

  private shouldHandlePopstate(form: HTMLFormElement) {
    return form.dataset.turboHandlePopstate === "true"
  }

  private onPopState = (event: PopStateEvent) => {
    const { searchParams } = event.state || {}
    this.formsHandlingPopstate.forEach((form) => {
      this.updateAndSubmitForm(searchParams, form)
    })
  }

  private updateAndSubmitForm(searchParams: FormData, form: HTMLFormElement) {
    form.submittedByTurboFormUrlUpdater = true;
    this.updateFormFields(searchParams, form)
    form.requestSubmit()
  }

  private updateFormFields = (searchParams: FormData, form: HTMLFormElement) => {
    const params = new URLSearchParams((searchParams || "").toString());
    this.resetFormFieldsValues(form)
    for (const [key, value] of params) {
      this.setFormFieldValue(form, key, value);
    }
  }

  private resetFormFieldsValues(form: HTMLFormElement) {
    form.querySelectorAll(`[name]`).forEach((field) => {
      (field as HTMLInputElement).value = ""
    })
  }

  private setFormFieldValue(form: HTMLFormElement, name: string, value: string) {
    const field = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
    if (field) {
      field.value = value;
    }
  }
}
