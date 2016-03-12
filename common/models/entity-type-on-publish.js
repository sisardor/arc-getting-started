module.exports = function (OnPublish) {
  OnPublish.prototype._upsert = function (action, callback) {
    callback(null)
  }
}
