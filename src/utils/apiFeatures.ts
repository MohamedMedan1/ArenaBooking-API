import { Query } from 'mongoose';
import { filterFields } from './filterFields';

export class APIFeatures{
  public query: Query<any[],any>;
  private queryString: any;

  constructor(query:Query<any[],any>,queryString:any) {
    this.query = query;  
    this.queryString = queryString;  
  }

  filter() {
    let filteredQueryStr = filterFields(this.queryString, 'sort', 'limit', 'page', 'fields');
    
    filteredQueryStr = JSON.stringify(filteredQueryStr).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(filteredQueryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    else this.query = this.query.sort('-createdAt');
    
    return this;
  }

  limit(){
    if (this.queryString.limit && (Number(this.queryString.limit) > 0))
      this.query = this.query.limit(Number(this.queryString.limit));

    return this;
  }

  fields() {
    if (this.queryString.fields) this.query = this.query.select(this.queryString.fields.split(',').join(' '));
    return this;
  }

  paginate() {
    if (this.queryString.page && (Number(this.queryString.page) > 0)) {
      const page = this.queryString.page || 1;
      const limit = Number(this.queryString.limit) || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
}
