'use strict';
module.exports = (sequelize, DataTypes) => {
  const SnippetTag = sequelize.define('SnippetTag', {
    snippet_id: DataTypes.INTEGER,
    tag_id: DataTypes.INTEGER
  }, {});
  SnippetTag.associate = function(models) {
    // associations can be defined here
  };
  return SnippetTag;
};