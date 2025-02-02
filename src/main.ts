import { Form, FormField, FormResponse } from "./types";

import { StorageService } from "./services/storage.js";

class FormBuilder {
  private currentForm: Form | null | undefined = null;
  private isPreviewMode = false;
  private readonly appElement: HTMLElement;

  // Creating an object of the class which is imported
  private storageObject = new StorageService();

  constructor() {
    this.appElement = document.getElementById("app") as HTMLElement;

    //display form list
    this.renderFormsList();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.appElement.addEventListener("click", (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.matches('[data-action="create-form"]')) {
        this.createNewForm();
      } else if (target.matches('[data-action="add-field"]')) {
        this.addField();
      } else if (target.matches('[data-action="delete-field"]')) {
        const fieldId = target.closest(".field")?.getAttribute("data-field-id");
        if (fieldId) this.deleteField(fieldId);
      } else if (target.matches('[data-action="preview-form"]')) {
        this.togglePreviewMode();
      } else if (target.matches('[data-action="edit-form"]')) {
        const formId = target.getAttribute("data-form-id");
        if (formId) this.editMode(formId);
      } else if (target.matches('[data-action="submit-form"]')) {
        this.submitForm();
      } else if (target.matches('[data-action="delete-responses"]')) {
        const formId = target.getAttribute("data-form-id");
        if (formId) this.deleteResponses(formId);
      } else if (target.matches('[data-action="view-responses"]')) {
        const formId = target.getAttribute("data-form-id");
        if (formId) this.viewResponses(formId);
      } else if (target.matches('[data-action="add-option"]')) {
        const fieldId = target.closest(".field")?.getAttribute("data-field-id");
        if (fieldId) this.addOptionField(fieldId);
      } else if (target.matches('[data-action="delete-option"]')) {
        const fieldId = target.closest(".field")?.getAttribute("data-field-id");
        const index = target.dataset.index;
        if (fieldId && index) this.deleteOptionField(fieldId, +index);
      }
    });

    
    // Handle field updates
    this.appElement.addEventListener("change", (e: Event) => {
        const target = e.target as HTMLElement;
        const field = target.closest(".field");
        const optionItem = target.closest(".option-item");
        if (!field) return;
  
        const fieldId = field.getAttribute("data-field-id");
        if (!fieldId) return;
        console.log("field", field);
        console.log("optionItem", optionItem);
  
        console.log("target", target);
  
        if (target.matches('[data-field="label"]')) {
          this.updateFieldLabel(fieldId, (target as HTMLInputElement).value);
        } else if (target.matches('[data-field="type"]')) {
          this.updateFieldType(
            fieldId,
            (target as HTMLSelectElement).value as FormField["type"]
          );
        } else if (target.matches('[data-field="required"]')) {
          this.updateFieldRequired(fieldId, (target as HTMLInputElement).checked);
        } else if (optionItem) {
          const optionIndex = optionItem.getAttribute("data-field-id");
          console.log("optionIndex", optionIndex);
          if (target.matches('[data-field="option"]') && optionItem) {
            this.updateFieldOption(
              fieldId,
              optionIndex,
              (target as HTMLInputElement).value
            );
          }
        }
      });
  }

  private createNewForm(): void {
    const name = prompt("Enter form name:");
    if (!name) return;

    this.currentForm = {
      id: crypto.randomUUID(),
      name,
      fields: [],
      createdAt: Date.now()
    };

    this.storageObject.saveForm(this.currentForm);
    this.renderFormBuilder();
  }

  private deleteField(fieldId: string): void {
    if (!this.currentForm) return;

    this.currentForm.fields = this.currentForm.fields.filter(
      (f) => f.id !== fieldId
    );
    this.storageObject.saveForm(this.currentForm);
    this.renderFormBuilder();
  }

  private addField(): void {
    if (!this.currentForm) return;

    const field: FormField = {
      id: crypto.randomUUID(),
      type: "text",
      label: "New Field",
      order: this.currentForm.fields.length,
      required: false
    };

    this.currentForm.fields.push(field);
    this.storageObject.saveForm(this.currentForm);
    this.renderFormBuilder();
  }

  private togglePreviewMode(): void {
    this.isPreviewMode = !this.isPreviewMode;
    this.renderFormBuilder();
  }

  private renderFormBuilder(): void {
    if (!this.currentForm) return;

    this.appElement.innerHTML = `
        <div class="container ${this.isPreviewMode ? "preview-mode" : ""}">
            <h1>${this.currentForm.name}</h1>
            
            ${
              !this.isPreviewMode
                ? `
                <button data-action="add-field">Add Field</button>
                <button data-action="preview-form">Preview Form</button>
            `
                : `
                <button data-action="preview-form">Edit Form</button>
            `
            }
            
            <form class="form-builder">
                ${this.currentForm.fields
                  .map((field) => this.renderField(field))
                  .join("")}
                
                ${
                  this.isPreviewMode && this.currentForm.fields.length > 0
                    ? `
                    <button type="button" data-action="submit-form">Submit Form</button>
                `
                    : ""
                }
            </form>
            
            <button onclick="window.location.reload()">Back to Forms</button>
        </div>
    `;
  }

  private renderField(field: FormField): string {
    if (this.isPreviewMode) {
      return `
              <div class="field" data-field-id="${field.id}">
                  <label>
                      ${field.label}
                      ${field.required ? '<span class="required">*</span>' : ""}
                  </label>
                  
                  ${this.renderFieldInput(field)}
              </div>
          `;
    }

    return `
        <div class="field" data-field-id="${field.id}">
            <input
                type="text"
                value="${field.label}"
                data-field="label"
                placeholder="Field Label"
            />
            
            <select data-field="type">
                <option value="text" ${
                  field.type === "text" ? "selected" : ""
                }>Text</option>
                <option value="radio" ${
                  field.type === "radio" ? "selected" : ""
                }>Radio</option>
                <option value="checkbox" ${
                  field.type === "checkbox" ? "selected" : ""
                }>Checkbox</option>
            </select>
            
            ${this.renderFieldOptions(field)}
            
            <div class="field-controls">
                <label>
                    <input
                        type="checkbox"
                        data-field="required"
                        ${field.required ? "checked" : ""}
                    />
                    Required
                </label>
                
                <button
                    type="button"
                    class="danger"
                    data-action="delete-field"
                >Delete</button>
            </div>
        </div>
    `;
  }

  private renderFieldInput(field: FormField): string {
    switch (field.type) {
      case "text":
        return `
                <input
                    type="text"
                    name="${field.id}"
                    ${field.required ? "required" : ""}
                />
            `;

      case "radio":
        return (
          field.options
            ?.map(
              (option) => `
                <label class="radio-label">
                    <input
                        type="radio"
                        name="${field.id}"
                        value="${option}"
                        ${field.required ? "required" : ""}
                    />
                    ${option}
                </label>
            `
            )
            .join("") || ""
        );

      case "checkbox":
        return (
          field.options
            ?.map(
              (option) => `
                <label class="checkbox-label">
                    <input
                        type="checkbox"
                        name="${field.id}"
                        value="${option}"
                    />
                    ${option}
                </label>
            `
            )
            .join("") || ""
        );

      default:
        return "";
    }
  }

  private renderFieldOptions(field: FormField): string {
    if (field.type !== "radio" && field.type !== "checkbox") return "";

    return `
        <div class="options-list">
            ${(field.options || [])
              .map(
                (option, index) => `
                <div class="option-item" data-field-id="${index}">
                    <input
                        type="text"
                        value="${option}"
                        data-field="option"
                        data-index="${index}"
                    />
                    ${
                      index > 0
                        ? `<button
                            type="button"
                            class="danger"
                            data-action="delete-option"
                            data-index="${index}"
                          >Remove</button>`
                        : ""
                    }
                </div>
            `
              )
              .join("")}
            <button
                type="button"
                data-action="add-option"
            >Add Option</button>
        </div>
    `;
  }

  private renderFormsList(): void {
    const forms = this.storageObject.getForms();

    this.appElement.innerHTML = `
            <div class="container">
                <h1>Form Builder</h1>
                <button data-action="create-form">Create New Form</button>
                
                <div class="forms-list">
                    ${forms
                      .map(
                        (form) => `
                        <div class="form-card">
                            <h3>${form.name}</h3>
                            <div class="form-actions">
                                <button data-action="edit-form" data-form-id="${form.id}">Preview Form</button>
                                <button data-action="view-responses" data-form-id="${form.id}">
                                    View Responses
                                </button>
                                <button class="danger" data-action="delete-responses" data-form-id="${form.id}">
                                    Delete
                                </button>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        `;
  }
  private deleteResponses(formId: string): void {
    console.log("formId", formId);

    this.storageObject.deleteForm(formId);
    alert("Form Deleted");
    window.location.reload();
  }

  editMode(formId: string): void {
    console.log("formId", formId);
    const form = this.storageObject.getForms().find((f) => f.id === formId);
    this.currentForm = form;
    console.log("this.currentForm", this.currentForm);
    this.isPreviewMode = !this.isPreviewMode;
    this.renderFormBuilder();
  }

  private updateFieldLabel(fieldId: string, label: string): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    if (field) {
      field.label = label;
      this.storageObject.saveForm(this.currentForm);
    }
  }

  private viewResponses(formId: string): void {
    const responses = this.storageObject
      .getResponses()
      .filter((r) => r.formId === formId);

    console.log("responses", responses);

    const form = this.storageObject.getForms().find((f) => f.id === formId);

    console.log("form", form);

    if (!form || !responses.length) {
      alert("No responses found");
      return;
    }

    this.appElement.innerHTML = `
        <div class="container">
            <h2>Responses for ${form.name}</h2>
            <div class="responses-list">
                ${responses
                  .map(
                    (response, index) => `
                    <div class="response-card" data-response-id="${
                      response.id
                    }">
                        <h3>Submitted at: ${new Date(
                          response.submittedAt
                        ).toLocaleString()}</h3>
                        <div class="response-data">
                            ${Object.entries(response.responses)
                              .map(([fieldId, value]) => {
                                const field = form.fields.find(
                                  (f) => f.id === fieldId
                                );
                                return field
                                  ? `
                                    <p><strong>${field.label}:</strong> ${
                                      Array.isArray(value)
                                        ? value.join(", ")
                                        : value
                                    }</p>
                                `
                                  : "";
                              })
                              .join("")}
                        </div>
                        <button class="edit-response" data-response-id="${
                          response.id
                        }" data-index="${index}">Edit</button>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <button onclick="window.location.reload()">Back to Forms</button>
        </div>
    `;
    document.querySelectorAll(".edit-response").forEach((button) => {
        button.addEventListener("click", (event) => {
          const target = event.target as HTMLElement;
          const responseId = target.getAttribute("data-response-id");
          const index = target.dataset.index;
          if (responseId && index) {
            this.editResponse(form, responseId, +index);
          }
        });
      });

  }

  private submitForm(): void {
    if (!this.currentForm) return;

    const form = this.appElement.querySelector("form");
    if (!form) return;

    const formData = new FormData(form);
    const responses: Record<string, string | string[]> = {};
    let isValid = true; // Flag for form validation
    let errorMessages: string[] = []; // Collect all error messages

    this.currentForm.fields.forEach((field) => {
      const inputElement = form.querySelector(
        `[name="${field.id}"]`
      ) as HTMLElement;

      if (field.required) {
        // Check if field is required
        if (field.type === "checkbox") {
          const values = formData.getAll(field.id);
          if (values.length === 0) {
            isValid = false;
            errorMessages.push(
              `Please select at least one option for ${field.label}`
            );
            inputElement?.classList.add("error"); // Highlight field
          } else {
            responses[field.id] = values.map((value) => value.toString());
            inputElement?.classList.remove("error");
          }
        } else {
          const value = formData.get(field.id);
          if (!value) {
            isValid = false;
            errorMessages.push(`Please fill out ${field.label}`);
            inputElement?.classList.add("error"); // Highlight field
          } else {
            responses[field.id] = value.toString();
            inputElement?.classList.remove("error");
          }
        }
      } else {
        // If field is not required, process normally
        if (field.type === "checkbox") {
          responses[field.id] = formData
            .getAll(field.id)
            .map((value) => value.toString());
        } else {
          const value = formData.get(field.id);
          if (value !== null) {
            responses[field.id] = value.toString();
          }
        }
      }
    });

    if (!isValid) {
      alert(`Form submission failed:\n\n${errorMessages.join("\n")}`);
      return;
    }

    const response: FormResponse = {
      id: crypto.randomUUID(),
      formId: this.currentForm.id,
      responses,
      submittedAt: Date.now()
    };

    this.storageObject.saveResponse(response);
    alert("Form submitted successfully!");
    this.renderFormsList();
  }

  private updateFieldOption(
    fieldId: string,
    optionIndex: string | null,
    label: string
  ): void {
    if (!this.currentForm) return;

    console.log(":fieldId", fieldId);
    console.log(":optionIndex", optionIndex);
    console.log(":label", label);

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    if (field && field.options) {
      if (optionIndex) {
        field.options[+optionIndex] = label;
      } else {
        console.error("Invalid optionIndex:", optionIndex);
      }
      this.storageObject.saveForm(this.currentForm);
    }
  }

  private updateFieldType(fieldId: string, type: FormField["type"]): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    if (field) {
      field.type = type;
      if (type === "radio" || type === "checkbox") {
        field.options = field.options || ["Option 1"];
      } else {
        delete field.options;
      }
      this.storageObject.saveForm(this.currentForm);
      this.renderFormBuilder();
    }
  }

  private addOptionField(fieldId: string): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    console.log("addoption ", field);
    if (field) {
      const optionLength = field?.options?.length
        ? field?.options?.length + 1
        : field?.options?.length;
      console.log("field.options ", field.options);
      field.options?.push(`Option ${optionLength}`);
      this.storageObject.saveForm(this.currentForm);
      this.renderFormBuilder();
    }
  }

  private deleteOptionField(fieldId: string, index: number): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    console.log("addoption ", field, index);
    if (field && index) {
      field.options?.splice(index, 1);
      this.storageObject.saveForm(this.currentForm);
      this.renderFormBuilder();
    }
  }

  private updateFieldRequired(fieldId: string, required: boolean): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    if (field) {
      field.required = required;
      this.storageObject.saveForm(this.currentForm);
    }
  }

  private editResponse(form: Form, responseId: string, index: number): void {
    const responses = this.storageObject.getResponses();
    const response = responses.find((r) => r.id === responseId);

    if (!response) return alert("Response not found!");

    this.appElement.innerHTML = `
        <div class="container">
            <h2>Edit Response for ${form.name}</h2>
            <form id="edit-response-form">
                ${form.fields
                  .map((field) => {
                    const value = response.responses[field.id] || "";
                    if (field.type === "checkbox") {
                      const checkedValues = Array.isArray(value) ? value : [];
                      return `
                                <p><strong>${field.label}</strong></p>
                                ${field.options
                                  ?.map(
                                    (option) => `
                                    <label>
                                        <input type="checkbox" name="${
                                          field.id
                                        }" value="${option}"
                                            ${
                                              checkedValues.includes(option)
                                                ? "checked"
                                                : ""
                                            } />
                                        ${option}
                                    </label>
                                `
                                  )
                                  .join("")}
                            `;
                    }
                    return `
                            <label>
                                <strong>${field.label}:</strong>
                                <input type="${field.type}" name="${field.id}" value="${value}" required />
                            </label>
                        `;
                  })
                  .join("")}
                <button type="submit">Save Changes</button>
                <button type="button" id="cancel-edit">Cancel</button>
            </form>
        </div>
    `;

    // Handle form submission
    document
      .getElementById("edit-response-form")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const updatedResponses: Record<string, string | string[]> = {};

        form.fields.forEach((field) => {
          if (field.type === "checkbox") {
            updatedResponses[field.id] = formData.getAll(field.id).map(String);
          } else {
            const value = formData.get(field.id);
            if (value !== null) {
              updatedResponses[field.id] = value.toString();
            }
          }
        });

        // Update response in storage
        response.responses = updatedResponses;
        console.log("response", response);
        console.log("index", index);
        this.storageObject.updateResponse(response, index);

        alert("Response updated successfully!");
        this.viewResponses(form.id);
      });

    // Handle cancel button
    document.getElementById("cancel-edit")?.addEventListener("click", () => {
      this.viewResponses(form.id);
    });
  }

}

// Initialize the application
new FormBuilder();
