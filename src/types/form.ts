export interface FormMetadata {
  menu: MenuMetadata;
  entities: EntityMetadata[];
  ui: UIMetadata;
  notifications: NotificationMetadata[];
}

export interface MenuMetadata {
  path: string;
}

export interface EntityMetadata {
  name: string;
  fields: FieldMetadata[];
}

export interface FieldMetadata {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  readonly?: boolean;
  binding?: BindingMetadata;
  validation?: ValidationMetadata;
  realTime?: RealTimeMetadata;
}


export interface BindingMetadata {
  property: string;
}

export interface ValidationMetadata {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: string;
}

export interface RealTimeMetadata {
  source: string;
}

export interface UIMetadata {
  layout: LayoutMetadata;
}

export interface LayoutMetadata {
  type: 'grid';
  rows: RowMetadata[];
}

export interface RowMetadata {
  columns: ColumnMetadata[];
}

export interface ColumnMetadata {
  width: string;
  sections: SectionMetadata[];
}

export interface SectionMetadata {
  title: string;
  fields: string[]; // Field references by name
}

export interface NotificationMetadata {
  name: string;
  trigger: TriggerMetadata;
  message: MessageMetadata;
  delivery: DeliveryMetadata;
}

export interface TriggerMetadata {
  event: 'OnDateReached' | 'OnValueChanged';
  field: string;
  condition?: string;
}

export interface MessageMetadata {
  title: string;
  body: string;
}

export interface DeliveryMetadata {
  method: 'websocket';
  source: string;
}

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'search'
  | 'textarea'
  | 'date'
  | 'datetime-local'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio';
