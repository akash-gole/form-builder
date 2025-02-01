import { Form, FormResponse } from "../types";

export class StorageService {
  private readonly FORMS_KEY = "form_builder_forms";

  getForms(): Form[] {
    const forms = localStorage.getItem(this.FORMS_KEY);
    return forms ? JSON.parse(forms) : [];
  }

  saveForm(form: Form): void {
    const forms = this.getForms();
    const existingIndex = forms.findIndex((f) => f.id === form.id);

    forms.push(form);

    localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
  }
}
