// Refactoring API Features


class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filters() {
        const queryObj = { ...this.queryStr };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //////// 2) Advanced filtering
        let querys = JSON.stringify(queryObj);
        querys = querys.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${(match)}`);
        this.query = this.query.find(JSON.parse(querys));
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy);
        }

        return this;
    }

    fieldsLimit() {
        if (this.queryStr.fields) {
            const SortBy = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(SortBy);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginations() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
