'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    tag: DataTypes.STRING
  }, {});
  Tag.associate = function(models) {
    Tag.belongsToMany(models.Snippet, {
      through: 'SnippetTag',
      as: 'snippets',
      foreignKey: 'tag_id'
    })
  };
  return Tag;
};
