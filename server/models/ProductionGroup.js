const
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,

  ProductionGroup = new Schema({
    productionDays: [{type: mongoose.Schema.Types.ObjectId, ref: 'Production'}],
    tag: String,
    title: String,
    by_: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }, {timestamps: true})

module.exports = mongoose.model('ProductionGroup', ProductionGroup)
