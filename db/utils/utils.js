exports.formatDates = list => {
  return list.map(element => {
    const elementCopy = { ...element };
    elementCopy.created_at = new Date(elementCopy.created_at);
    return elementCopy;
  });
};

exports.makeRefObj = (list, key, val) => {
  return list.reduce((refObj, element) => {
    refObj[element[key]] = element[val];
    return refObj;
  }, {});
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(element => {
    const elementCopy = { ...element };
    elementCopy.author = elementCopy.created_by;
    delete elementCopy.created_by;
    elementCopy.article_id = articleRef[elementCopy.belongs_to];
    delete elementCopy.belongs_to;
    elementCopy.created_at = new Date(elementCopy.created_at);
    return elementCopy;
  });
};
