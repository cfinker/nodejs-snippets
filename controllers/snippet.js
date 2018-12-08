const Snippet = require('../models').Snippet;
const Tag = require('../models').Tag;
const SnippetTag = require('../models').SnippetTag;

module.exports = {
    list(req, res) {
        let whereRulesObj = {}
        let whereArrayForTags = [];

        console.log(req.query);
        for (var k in req.query){
            if (req.query.hasOwnProperty(k)) {
                if(k != "tag") whereRulesObj[k] = req.query[k];
                else whereArrayForTags.push(req.query[k]);
            }
        }

        return Snippet
            .findAll({
                where: whereRulesObj,
                include: [{
                    model: Tag,
                    as: 'tags',
                }],
                order: [
                    ['createdAt', 'DESC'],
                    [{model: Tag, as: 'tags'}, 'tag', 'ASC'],
                ],
            })
            .then((snippets) => {
                var snArray = [];
                console.log(snArray);
                snippets.forEach((snippet) => {
                    let tagFound = false;
                    var sn = snippet.dataValues;
                    var tagsArray = [];
                    var tags = sn.tags;
                    tags.forEach(function (tagObj) {
                        tg = tagObj.dataValues;
                        if(tg.tag != null) tagsArray.push(tg.tag);
                        if(whereArrayForTags.includes(tg.tag)) tagFound = true;
                    });

                    sn.tags = tagsArray;
                    if(whereArrayForTags.length == 0 || tagFound) snArray.push(sn);
                });
                res.status(200).send(snArray)
            })
            .catch((error) => {
                res.status(500).send(error);
            });
    },

    getById(req, res) {
        return Snippet
            .findById(req.params.id, {
                include: [{
                    model: Tag,
                    as: 'tags',
                    attributes: ['tag']
                }],
                order: [
                    ['createdAt', 'DESC'],
                    [{model: Tag, as: 'tags'}, 'tag', 'ASC'],
                ],
            }).then((snippet) => {
                if (!snippet) {
                    return res.status(404).send({
                        message: 'Snippet Not Found',
                    });
                }
                var sn = snippet.dataValues;
                console.log(sn);
                var tagsArray = [];
                var tags = sn.tags;
                tags.forEach(function (tagObj) {
                    tg = tagObj.dataValues;
                    if(tg.tag != null) tagsArray.push(tg.tag);
                });

                sn.tags = tagsArray;
                res.status(200).send(sn)
            })
            .catch((error) => res.status(500).send(error));
    },

    add(req, res) {

        var promises = [];
        var tagIds = [];
        var snippetId;
        let tags = req.body.tags;

        for (let i in tags) {
            promises.push(Tag.findOrCreate({where: {tag: req.body.tags[i]}}).spread((dbTag, created) => {
                tagIds.push(dbTag.id);
            }));
        }

        promises.push(Snippet.create({
            name: req.body.name,
            description: req.body.description,
            author: req.body.author,
            language: req.body.language,
            code: req.body.code
        }).then((snippet) => {
            snippetId = snippet.id;
        }));

        return  Promise.all(promises)
            .then(() => {
                var promises = tagIds.map(function(id){
                    return SnippetTag.create({snippet_id: snippetId, tag_id: id});
                });
                Promise.all(promises).then(
                    Snippet.findById(snippetId, {
                        include: [{
                            model: Tag,
                            as: 'tags',
                            attributes: ['tag']
                        }],
                    }).then((snippet) => {
                        var sn = snippet.dataValues;
                        console.log(sn);
                        sn.tags = tags;
                        res.status(201).send(sn)
                    })
                    .catch((error) => {
                        console.log(error);
                        res.status(500).send(error)
                    }))
            });
    },

    update(req, res) {
        var promises = [];
        var tagIds = [];
        var snippetId = req.params.id;
        let tags = req.body.tags;

        return Snippet
            .findById(req.params.id, {
                include: [{
                    model: Tag,
                    as: 'tags',
                }],
            })
            .then(snippet => {
                if (!snippet) {
                    return res.status(404).send({
                        message: 'Snippet Not Found',
                    });
                }

                let sn = snippet.get({
                    plain: true
                });
                console.log(sn);

                sn.tags.forEach(function (tagObj) {
                    if(!tags.includes(tagObj.tag)) SnippetTag.findOne({where: {
                        snippet_id: snippetId, tag_id: tagObj.id
                    }}).then((row) => row.destroy());
                });

                for (let i in sn.tags) {
                    if(sn.tags) promises.push(Tag.findOrCreate({where: {tag: tags[i]}}).spread((dbTag, created) => {
                        tagIds.push(dbTag.id);
                    }));
                }

                promises.push(snippet
                    .update({
                        name: req.body.name || "",
                        description: req.body.description || "",
                        author: req.body.author || "",
                        language: req.body.language || "",
                        code: req.body.code || "",
                    }).then((snippet) => {
                        snippetId = snippet.id;
                    }));

                return Promise.all(promises)
                    .then((snippet) => {
                        console.log('again')
                        let records = [];
                        for (let i in tagIds) {
                            records.push({snippet_id: snippetId, tag_id: tagIds[i]});
                        }
                        SnippetTag.bulkCreate(records, { individualHooks: true, returning: true })
                            .then(Snippet
                                .findById(snippetId, {
                                    include: [{
                                        model: Tag,
                                        as: 'tags',
                                    }],
                                }).then((snippet) => {
                                    var sn = snippet.dataValues;
                                    console.log(sn);
                                    sn.tags = tags;
                                    res.status(200).send(sn)
                                })
                                .catch((error) => {
                                    console.log(error);
                                    res.status(500).send(error)
                                }))
                    });
            })
            .catch((error) =>{
                console.log(error);
                res.status(500).send(error);
            });
    },

    delete(req, res) {
        return Snippet
            .findById(req.params.id)
            .then(snippet => {
                if (!snippet) {
                    return res.status(404).send({
                        message: 'Snippet Not Found',
                    });
                }
                var snippetId = snippet.id;
                return snippet
                    .destroy()
                    .then(() => res.status(200).send())
                    .catch((error) => res.status(400).send(error));
            })
            .catch((error) => res.status(500).send(error));
    },
};
