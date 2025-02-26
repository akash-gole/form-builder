import { Form, FormResponse } from '../types';

export class StorageService {
    private readonly FORMS_KEY = 'form_builder_forms';
    private readonly RESPONSES_KEY = 'form_builder_responses';

    getForms(): Form[] {
        const forms = localStorage.getItem(this.FORMS_KEY);
        return forms ? JSON.parse(forms) : [];
    }

     saveForm(form: Form): void {
        const forms = this.getForms();
        const existingIndex = forms.findIndex(f => f.id === form.id);
        
        if (existingIndex >= 0) {
            forms[existingIndex] = form;
        } else {
            forms.push(form);
        }
        
        localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
    }

     deleteForm(formId: string): void {
        const forms = this.getForms().filter(f => f.id !== formId);
        localStorage.setItem(this.FORMS_KEY, JSON.stringify(forms));
        
        // Clean up associated responses
        const responses = this.getResponses().filter(r => r.formId !== formId);
        localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));
    }

     getResponses(): FormResponse[] {
        const responses = localStorage.getItem(this.RESPONSES_KEY);
        return responses ? JSON.parse(responses) : [];
    }

     saveResponse(response: FormResponse): void {
        const responses = this.getResponses();
        responses.push(response);
        localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));
    }

    updateResponse(response: FormResponse, index: number): void {
        const responses = this.getResponses();
        responses[index] = response;
        localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses));
    }
}