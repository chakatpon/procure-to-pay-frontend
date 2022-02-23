const SeparateNumberByComma = (
  number = 0,
  decimal = 2
  ) => {
    return parseFloat(number)
    .toFixed(decimal)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default SeparateNumberByComma
