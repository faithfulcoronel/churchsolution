import { FormMetadata, MenuMetadata, EntityMetadata, FieldMetadata, FieldType, BindingMetadata, ValidationMetadata, RealTimeMetadata, UIMetadata, RowMetadata, ColumnMetadata, SectionMetadata, NotificationMetadata } from "@/types/form";

export function parseXmlMetadata(xmlString: string): FormMetadata {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
    const metadata: FormMetadata = {
      menu: parseMenu(xmlDoc),
      entities: parseEntities(xmlDoc),
      ui: parseUI(xmlDoc),
      notifications: parseNotifications(xmlDoc)
    };
  
    return metadata;
  }
  
  function parseMenu(xmlDoc: Document): MenuMetadata {
    const menuElement = xmlDoc.querySelector('Menu');
    return {
      path: menuElement?.getAttribute('path') || ''
    };
  }
  
  function parseEntities(xmlDoc: Document): EntityMetadata[] {
    const entities: EntityMetadata[] = [];
    const entityElements = xmlDoc.querySelectorAll('Entity');
  
    entityElements.forEach(entityElement => {
      const fields: FieldMetadata[] = [];
      const fieldElements = entityElement.querySelectorAll('Field');
  
      fieldElements.forEach(fieldElement => {
        const field: FieldMetadata = {
          name: fieldElement.getAttribute('name') || '',
          type: fieldElement.getAttribute('type') as FieldType || 'text',
          label: fieldElement.getAttribute('label') || '',
          readonly: fieldElement.getAttribute('readonly') === 'true',
          binding: parseBinding(fieldElement),
          validation: parseValidation(fieldElement),
          realTime: parseRealTime(fieldElement)
        };
        fields.push(field);
      });
  
      entities.push({
        name: entityElement.getAttribute('name') || '',
        fields
      });
    });
  
    return entities;
  }
  
  function parseBinding(fieldElement: Element): BindingMetadata | undefined {
    const bindingElement = fieldElement.querySelector('Binding');
    if (!bindingElement) return undefined;
  
    return {
      property: bindingElement.getAttribute('property') || ''
    };
  }
  
  function parseValidation(fieldElement: Element): ValidationMetadata | undefined {
    const validationElement = fieldElement.querySelector('Validation');
    if (!validationElement) return undefined;
  
    return {
      required: validationElement.getAttribute('required') === 'true',
      minLength: parseInt(validationElement.getAttribute('minLength') || '0'),
      maxLength: parseInt(validationElement.getAttribute('maxLength') || '0'),
      regex: validationElement.getAttribute('regex') || undefined
    };
  }
  
  function parseRealTime(fieldElement: Element): RealTimeMetadata | undefined {
    const realTimeElement = fieldElement.querySelector('RealTime');
    if (!realTimeElement) return undefined;
  
    return {
      source: realTimeElement.getAttribute('source') || ''
    };
  }
  
  function parseUI(xmlDoc: Document): UIMetadata {
    const layout = xmlDoc.querySelector('Layout');
    const rows: RowMetadata[] = [];
  
    layout?.querySelectorAll('Row').forEach(rowElement => {
      const columns: ColumnMetadata[] = [];
      
      rowElement.querySelectorAll('Column').forEach(columnElement => {
        const sections: SectionMetadata[] = [];
        
        columnElement.querySelectorAll('Section').forEach(sectionElement => {
          const fields: string[] = [];
          sectionElement.querySelectorAll('FieldRef').forEach(fieldRef => {
            const fieldName = fieldRef.getAttribute('name');
            if (fieldName) fields.push(fieldName);
          });
  
          sections.push({
            title: sectionElement.getAttribute('title') || '',
            fields
          });
        });
  
        columns.push({
          width: columnElement.getAttribute('width') || '100%',
          sections
        });
      });
  
      rows.push({ columns });
    });
  
    return {
      layout: {
        type: 'grid',
        rows
      }
    };
  }
  
  function parseNotifications(xmlDoc: Document): NotificationMetadata[] {
    const notifications: NotificationMetadata[] = [];
    const notificationElements = xmlDoc.querySelectorAll('Notification');
  
    notificationElements.forEach(notificationElement => {
      const triggerElement = notificationElement.querySelector('Trigger');
      const messageElement = notificationElement.querySelector('Message');
      const deliveryElement = notificationElement.querySelector('Delivery');
  
      if (triggerElement && messageElement && deliveryElement) {
        notifications.push({
          name: notificationElement.getAttribute('name') || '',
          trigger: {
            event: triggerElement.getAttribute('event') as 'OnDateReached' | 'OnValueChanged',
            field: triggerElement.getAttribute('field') || '',
            condition: triggerElement.getAttribute('condition') || undefined
          },
          message: {
            title: messageElement.getAttribute('title') || '',
            body: messageElement.getAttribute('body') || ''
          },
          delivery: {
            method: 'websocket',
            source: deliveryElement.getAttribute('source') || ''
          }
        });
      }
    });
  
    return notifications;
  }