import { Model } from 'mongoose';

export default class Dao<T extends Model<any>> {
    /**
     * User Model.
     * @param {T} model Any database model
     */
    public model: T;

    /**
     * Constructor
     * @param {T} model Any database model
     */
    constructor(model: T) {
        this.model = model;
    }
}
