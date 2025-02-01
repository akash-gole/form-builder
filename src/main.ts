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
                </div>
            `
              )
              .join("")}
            
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

  private updateFieldLabel(fieldId: string, label: string): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    if (field) {
      field.label = label;
      this.storageObject.saveForm(this.currentForm);
    }
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

  private updateFieldRequired(fieldId: string, required: boolean): void {
    if (!this.currentForm) return;

    const field = this.currentForm.fields.find((f) => f.id === fieldId);
    if (field) {
      field.required = required;
      this.storageObject.saveForm(this.currentForm);
    }
  }

}

// Initialize the application
new FormBuilder();
