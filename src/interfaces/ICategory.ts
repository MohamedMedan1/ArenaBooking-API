export interface ICategory extends Document {
  name: string;
  image: string;
  imagePublicId: string;
  createdAt: Date;
}
