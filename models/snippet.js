'use strict';
module.exports = (sequelize, DataTypes) => {
  const Snippet = sequelize.define('Snippet', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    author: DataTypes.STRING,
    language: DataTypes.STRING,
    code: DataTypes.STRING
  }, {});
  Snippet.associate = function(models) {
    Snippet.belongsToMany(models.Tag, {
      through: 'SnippetTag',
      as: 'tags',
      foreignKey: 'snippet_id'
    })
  };
  return Snippet;
};
