import { Form, FormField, FormResponse } from "./types";

import { StorageService } from "./services/storage.js";

class FormBuilder {
  private currentForm: Form | null | undefined = null;
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
    });
  }

  private renderFormsList(): void {

    this.appElement.innerHTML = `
            <div class="container">
                <h1>Form Builder</h1>
                <button data-action="create-form">Create New Form</button>
                
                <div class="forms-list">
                    
                </div>
            </div>
        `;
  }
}



// Initialize the application
new FormBuilder();
