export type FieldType = 'text' | 'radio' | 'checkbox';

export interface FormField {
    id: string;
    type: FieldType;
    label: string;
    options?: string[];
    required?: boolean;
    order: number;
}

export interface Form {
    id: string;
    name: string;
    fields: FormField[];
    createdAt: number;
}

export interface FormResponse {
    id: string;
    formId: string;
    responses: Record<string, string | string[]>;
    submittedAt: number;
}