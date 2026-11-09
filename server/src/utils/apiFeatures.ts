import { Query } from 'mongoose';

interface QueryString {
  [key: string]: string | undefined;
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
}

export class ApiFeatures<T> {
  private query: Query<T[], T>;
  private queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const excluded = ['page', 'limit', 'sort', 'fields'];
    const filterObj: Record<string, unknown> = {};

    Object.entries(this.queryString).forEach(([key, value]) => {
      if (!excluded.includes(key) && value !== undefined) {
        filterObj[key] = value;
      }
    });

    const filterStr = JSON.stringify(filterObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );
    this.query = this.query.find(JSON.parse(filterStr) as Record<string, unknown>);
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate(): this {
    const page = Math.max(1, parseInt(this.queryString.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(this.queryString.limit ?? '20', 10)));
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getQuery(): Query<T[], T> {
    return this.query;
  }
}
