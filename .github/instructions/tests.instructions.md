---
applyTo: "test/**/*.test.js"
---

# Test instructions

- Never use `test.each`, `it.each`, `describe.each` or any other table-driven syntax.
- Write each case out as its own nested `describe()` block containing its own `test()`. Favour verbosity and readability over brevity.
- Name each case's `describe()` after the case, for example `and the legal status is "Private limited company"`.

Don't:

```js
describe('when the legal status requires a company registration number', () => {
  test.each([
    ['Community interest company', '102102'],
    ['Private limited company', '102109']
  ])('it shows the company registration number for %s', (_, legalStatusCode) => {
    data.legalStatusCode = Number(legalStatusCode)

    const result = businessDetailsPresenter(data)

    expect(result.legalStatusRegistrationNumber.value).toEqual('12345678')
  })
})
```

Do:

```js
describe('when the legal status requires a company registration number', () => {
  describe('and the legal status is "Community interest company"', () => {
    test('it shows the company registration number', () => {
      data.legalStatusCode = 102102

      const result = businessDetailsPresenter(data)

      expect(result.legalStatusRegistrationNumber.value).toEqual('12345678')
    })
  })

  describe('and the legal status is "Private limited company"', () => {
    test('it shows the company registration number', () => {
      data.legalStatusCode = 102109

      const result = businessDetailsPresenter(data)

      expect(result.legalStatusRegistrationNumber.value).toEqual('12345678')
    })
  })
})
```
