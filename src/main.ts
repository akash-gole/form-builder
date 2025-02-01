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
}







// Initialize the application
new FormBuilder();
