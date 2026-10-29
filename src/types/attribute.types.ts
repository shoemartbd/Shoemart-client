export interface IAttributeValue {
  id: string;
  value: string;
  attributeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttribute {
  id: string;
  name: string;
  values: IAttributeValue[];
  createdAt: string;
  updatedAt: string;
}
