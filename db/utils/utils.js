exports.formatDates = list => {
  return list.map(article => {
    const articleCopy = { ...article };
    articleCopy.created_at = new Date(articleCopy.created_at);
    return articleCopy;
  });
};

exports.makeRefObj = (list, key, val) => {
  return list.reduce((refObj, element) => {
    refObj[element[key]] = element[val];
    return refObj;
  }, {});
};

exports.formatComments = (comments, articleRef) => {};
