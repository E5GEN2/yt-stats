import { IStatModel } from '@models/index';
import Dao from '@models/dataAccessObject';

export default class StatService extends Dao<IStatModel> {
    /**
     * Constructor
     * @param {IStatModel} model User Db Model
     */
    constructor(model: IStatModel) {
        super(model);
    }
}
