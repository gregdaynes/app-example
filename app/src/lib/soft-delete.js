'use strict'

// Fork of https://github.com/griffinpp/objection-soft-delete
// Repository & module no longer maintained, MIT License
//
// This fork fixes an issue where using a date stamp as deletedValue did not work as desired when
// provided as a function.
// Original: deletedValue would be evaluated at runtime and stored on the model with the time the
// base model class was built (not on the instance). This means that when the object was "deleted"
// the value stored in the database would be when the application first created the base model,
// not when the action was performed.

module.exports = (incomingOptions) => {
  const options = Object.assign({
    columnName: 'deleted',
    deletedValue: true,
    notDeletedValue: false,
  }, incomingOptions)

  return (Model) => {
    class SDQueryBuilder extends Model.QueryBuilder {
      // override the normal delete function with one that patches the row's "deleted" column
      delete () {
        // Replaced mergeContext with context due to deprecation
        this.context({
          softDelete: true,
        })

        const patch = {}
        // Implements the fix for deletedValue being able to be a function
        if (typeof options.deletedValue === 'function') {
          patch[options.columnName] = options.deletedValue()
        } else {
          patch[options.columnName] = options.deletedValue
        }

        return this.patch(patch)
      }

      // provide a way to actually delete the row if necessary
      hardDelete () {
        return super.delete()
      }

      // provide a way to undo the delete
      undelete () {
        this.context({
          undelete: true,
        })

        const patch = {}
        patch[options.columnName] = options.notDeletedValue

        return this.patch(patch)
      }

      // provide filter to ONLY deleted records without having to remember the column name
      whereDeleted () {
        const tableColumn = `${this.modelClass().tableName}.${options.columnName}`
        // this if is for backwards compatibility
        // to protect those that used a nullable `deleted` field
        if (options.deletedValue === true) {
          return this.where(tableColumn, options.deletedValue)
        }
        // qualify the column name
        return this.whereNot(tableColumn, options.notDeletedValue)
      }

      // provide a way to filter out deleted records without having to remember the column name
      whereNotDeleted () {
        const tableColumn = `${this.modelClass().tableName}.${options.columnName}`
        // qualify the column name
        return this.where(tableColumn, options.notDeletedValue)
      }
    }
    return class extends Model {
      static get QueryBuilder () {
        return SDQueryBuilder
      }

      // add a named filter for use in the .eager() function
      static get namedFilters () {
        // patch the notDeleted filter into the list of namedFilters
        return Object.assign({}, super.namedFilters, {
          notDeleted: (b) => {
            b.whereNotDeleted()
          },
          deleted: (b) => {
            b.whereDeleted()
          },
        })
      }

      static get isSoftDelete () {
        return true
      }
    }
  }
}
