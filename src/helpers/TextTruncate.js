const TextTruncate = (text, limit) => {
  var textLimit = limit;
  if (text.length <= textLimit) {
    return text;
  } else {
    return text.substring(0, textLimit) + "...";
  }
};

export default TextTruncate;
